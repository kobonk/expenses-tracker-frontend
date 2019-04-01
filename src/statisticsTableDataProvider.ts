import i18n from 'utils/i18n';
import { retrieveExpenses } from "utils/restClient";
import ExpenseCategory from "types/ExpenseCategory";
import MonthStatistics from "types/MonthStatistics";
import MonthTotal from "types/MonthTotal";
import { extractMonthName, formatNumber } from "utils/stringUtils";
import { DataTableCell, TableData } from "./components/data-table/data-table";
import { DataTableRecord, DataTableRecordCollection } from "./components/data-table/data-table-types";

const _ = require("lodash");
const moment = require("moment");

const decimalPoints = 2;
const blankMonth = "9999-12"

class StatisticsTableCell implements DataTableCell {
    private categoryId: string;
    private month: string;
    private content: string;
    private onClickCallback: Function;

    constructor(categoryId: string, month: string, content: string, onClickCallback: Function = _.noop) {
        this.categoryId = categoryId;
        this.month = month;
        this.content = content;
        this.onClickCallback = onClickCallback;
    }

    public getContent(): string {
        return this.content;
    }

    public getName(): string {
        return "";
    }

    public isClickable(): boolean {
        return _.isFunction(this.onClickCallback);
    }

    public isEditable(): boolean {
        return false;
    }

    public onClick() {
        if (!this.isClickable()) {
            return;
        }

        retrieveExpenses(this.categoryId, this.month)
        .then((expenses: Array<any>) => this.onClickCallback(expenses));
    }
}

const getMonths: Function = (numberOfMonths: number): Array<string> => {
    let currentMonth = moment();
    return _.map(Array.from(Array(numberOfMonths).keys()), (monthDifference: number) => {
        return currentMonth.clone().subtract(monthDifference, "months").format("YYYY-MM");
    });
};

const getMonthNames: Function = (months: Array<string>): Array<string> => {
    return _.map(months, extractMonthName);
};

const getRows: Function = (
    statistics: Array<MonthStatistics>,
    months: Array<string>,
    onTableCellClicked: Function
): Array<Array<DataTableCell>> => {
    return _.map(statistics, (stat: MonthStatistics) => {
        const category: ExpenseCategory = stat.getCategory();
        const categoryCell: DataTableCell = new StatisticsTableCell(
            category.getId(),
            blankMonth,
            category.getName(),
            onTableCellClicked
        );

        const monthTotals: Array<MonthTotal> = stat.getMonths();
        const monthTotalsMap = _.keyBy(monthTotals, _.method("getMonth"));

        const row: Array<DataTableCell> = _.map(months, (month: string) => {
            const monthTotal: MonthTotal = _.get(monthTotalsMap, month);
            const total: number = _.isNil(monthTotal) ? 0 : monthTotal.getTotal() as number;

            return new StatisticsTableCell(
                category.getId(),
                month,
                formatNumber(total, decimalPoints),
                _.isNil(monthTotal) ? null : onTableCellClicked
            );
        });

        return _.concat([categoryCell], row);
    });
};

const getTotals: Function = (statistics: Array<MonthStatistics>, months: Array<string>): Array<number> => {
    if (_.isEmpty(statistics)) {
        return [];
    }

    let initialTable = _.map(months, _.constant(0));

    return _.reduce(
        statistics,
        (result: Array<number>, row: MonthStatistics) => {
            let monthTotalsMap = _.keyBy(row.getMonths(), _.method("getMonth"));

            return _.map(months, (month: string, index: number) => {
                let monthTotal: MonthTotal = _.get(monthTotalsMap, month);
                let total: number = _.isNil(monthTotal) ? 0 : monthTotal.getTotal() as number;

                return result[index] + total;
            });
        },
        initialTable
    );
};

const formatNumericCell: Function = (cellValue: string | Number | null | undefined): string => {
    if (_.isNil(cellValue)) {
        return (0).toFixed(decimalPoints);
    }
    if (cellValue instanceof String) {
        return parseFloat(cellValue as string).toFixed(decimalPoints);
    }

    let numericValue = _.isNil(cellValue) ? 0 : cellValue instanceof String ? parseFloat(String(cellValue)) : cellValue;

    return formatNumber(numericValue, decimalPoints);
};

const prepareData: Function = (
    statistics: Array<MonthStatistics>,
    numberOfMonths: Number,
    onTableCellClicked: Function
): TableData => {
    let months: Array<string> = getMonths(numberOfMonths);
    let footer = _.concat([i18n.statisticsTable.totalLabel], _.map(getTotals(statistics, months), formatNumericCell));
    let header = _.concat([i18n.statisticsTable.categoryLabel], getMonthNames(months));
    let rows = getRows(statistics, months, onTableCellClicked);

    const data: StatisticsTableData = new StatisticsTableData(months, statistics, onTableCellClicked);

    return { data, footer, header, rows } as TableData;
}

class StatisticsRecordCollection implements DataTableRecordCollection {
    private key: string;
    private records: Array<DataTableRecord>;

    constructor(key: string, records: Array<DataTableRecord>) {
        this.key = key;
        this.records = records;
    }

    getKey(): string {
        return this.key;
    }

    getRecords(): Array<DataTableRecord> {
        return this.records;
    }
}

class StatisticsRecordBase implements DataTableRecord {
    protected name: string;
    protected value: string;

    getName(): string {
        return this.name;
    }

    getValue(): string {
        return this.value;
    }

    isClickable(): boolean {
        return false;
    }

    isEditable(): boolean {
        return false;
    }

    onClick(): void {
        // Nothing happens
    }
}

class StatisticsEmptyRecord extends StatisticsRecordBase {
    constructor(name: string) {
        super();

        this.name = name;
        this.value = formatNumber(0);
    }
}

class StatisticsCategoryRecord extends StatisticsRecordBase {
    constructor(name: string, value: string) {
        super();

        this.name = name;
        this.value = value;
    }
}

class StatisticsMonthRecord extends StatisticsRecordBase {
    private onClickCallback: Function;

    constructor(name: string, value: string, onClickCallback: Function) {
        super();

        this.name = name;
        this.value = value;
        this.onClickCallback = onClickCallback;
    }

    isClickable(): boolean {
        return true;
    }

    onClick(): void {
        this.onClickCallback(this.name);
    }
}

class StatisticsHeaderRecord extends StatisticsRecordBase {
    private onClickCallback: Function;

    constructor(name: string, value: string, onClickCallback: Function) {
        super();

        this.name = name;
        this.value = value;
        this.onClickCallback = onClickCallback;
    }

    isClickable(): boolean {
        return true;
    }

    onClick(): void {
        this.onClickCallback();
    }
}

class StatisticsFooterRecord extends StatisticsRecordBase {
    constructor(value: string) {
        super();

        this.value = value;
    }
}

class StatisticsTableData {
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
                    () => onTableCellClicked({ categoryId, month })
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


export default prepareData;
