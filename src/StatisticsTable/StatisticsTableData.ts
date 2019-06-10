import i18n from 'utils/i18n';
import ExpenseCategory from "types/ExpenseCategory";
import MonthStatistics from "types/MonthStatistics";
import MonthTotal from "types/MonthTotal";
import { extractMonthName, formatNumber } from "utils/stringUtils";
import { DataTableData, DataTableRecord, DataTableRecordCollection } from "./../types/DataTableTypes";

import {
    StatisticsRecordCollection,
    StatisticsEmptyRecord,
    StatisticsCategoryRecord,
    StatisticsMonthRecord,
    StatisticsHeaderRecord,
    StatisticsFooterRecord
} from "./types";

const _ = require("lodash");
const moment = require("moment");

const getMonths: Function = (numberOfMonths: number): Array<string> => {
    let currentMonth = moment();
    return _.map(Array.from(Array(numberOfMonths).keys()), (monthDifference: number) => {
        return currentMonth.clone().subtract(monthDifference, "months").format("YYYY-MM");
    });
};

class StatisticsTableData implements DataTableData {
    private months: Array<string>;
    private sortingKey: string;
    private sortingDirection: string;

    private header: Array<DataTableRecordCollection>;
    private body: Array<DataTableRecordCollection>;
    private footer: Array<DataTableRecordCollection>;

    constructor(months: Array<string>, statistics: Array<MonthStatistics>, onTableCellClicked: Function) {
        this.months = months;
        this.header = this.createHeader();
        this.body = this.createBody(statistics, onTableCellClicked);
        this.footer = this.createFooter(statistics);

        this.sortingKey = "category";
        this.sortingDirection = "desc";

        this.sort(this.sortingKey);
    }

    public getHeader(): Array<DataTableRecordCollection> {
        return this.header;
    }

    public getBody(): Array<DataTableRecordCollection> {
        return this.body;
    }

    public getFooter(): Array<DataTableRecordCollection> {
        return this.footer;
    }

    public getSortingDirection(): string {
        return this.sortingDirection;
    }

    public getSortingKey(): string {
        return this.sortingKey;
    }

    private createHeader(): Array<DataTableRecordCollection> {
        const records = _.chain(this.months)
        .map((month: string) => {
            return new StatisticsHeaderRecord(month, extractMonthName(month), () => this.sort(month));
        })
        .value();

        const categoryLabel = i18n.statisticsTable.categoryLabel;

        const categoryRecord = new StatisticsHeaderRecord(
            "category",
            categoryLabel,
            () => this.sort("category")
        );

        return [new StatisticsRecordCollection("header", [categoryRecord, ...records])];
    }

    private createBody(statistics: Array<MonthStatistics>, onTableCellClicked: Function): Array<DataTableRecordCollection> {
        return _.map(statistics, (stat: MonthStatistics) => {
            const category: ExpenseCategory = stat.getCategory();
            const categoryId: string = category.getId();
            const categoryRecord: StatisticsCategoryRecord = new StatisticsCategoryRecord("category", category.getName());
            const monthTotalsMap = _.keyBy(stat.getMonths(), _.method("getMonth"));

            const records: Array<StatisticsMonthRecord> = _.map(this.months, (month: string) => {
                const monthTotal: MonthTotal = _.get(monthTotalsMap, month);
                const total: number = _.isNil(monthTotal) ? 0 : monthTotal.getTotal() as number;

                if (total === 0) return new StatisticsEmptyRecord(month);

                return new StatisticsMonthRecord(
                    month,
                    formatNumber(total),
                    () => onTableCellClicked({ category, month })
                );
            });

            return new StatisticsRecordCollection(categoryId, [categoryRecord, ...records]);
        });
    }

    private createFooter(statistics: Array<MonthStatistics>): Array<DataTableRecordCollection> {
        let initialTotals: Array<number> = _.map(this.months, _.constant(0));

        const records = _.chain(statistics)
        .reduce(
            (result: Array<number>, row: MonthStatistics) => {
                let monthTotalsMap = _.keyBy(row.getMonths(), _.method("getMonth"));

                return _.map(this.months, (month: string, index: number) => {
                    let monthTotal: MonthTotal = _.get(monthTotalsMap, month);
                    let total: number = _.isNil(monthTotal) ? 0 : monthTotal.getTotal() as number;

                    return result[index] + total;
                });
            },
            initialTotals
        )
        .map((total: number) => new StatisticsFooterRecord(formatNumber(total)))
        .value();

        return [new StatisticsRecordCollection("footer", [new StatisticsFooterRecord(i18n.statisticsTable.totalLabel), ...records])];
    }

    private sort(key: string) {
        if (key === this.sortingKey) {
            this.sortingDirection = this.sortingDirection === "asc" ? "desc" : "asc";
        }

        this.sortingKey = key;

        const sorted = _.sortBy(this.body, (row: DataTableRecordCollection) => {
            const result = _.chain(row.getRecords())
            .find((record: DataTableRecord) => record.getName() === this.sortingKey)
            .value();

            const numericValue = parseFloat(result.getValue().replace(/\s/g, ""));

            return isNaN(numericValue) ? result.getValue() : numericValue;
        });

        this.body = this.sortingDirection === "asc" ? sorted : sorted.reverse();
    }
}

export { StatisticsTableData };
