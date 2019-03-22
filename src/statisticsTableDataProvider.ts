import i18n from 'utils/i18n';
import { retrieveExpenses } from "utils/restClient";
import ExpenseCategory from "types/ExpenseCategory";
import MonthStatistics from "types/MonthStatistics";
import MonthTotal from "types/MonthTotal";
import { extractMonthName, formatNumber } from "utils/stringUtils";
import { DataTableCell, TableData } from "./components/data-table/data-table";

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
        let category: ExpenseCategory = stat.getCategory();
        let categoryCell: DataTableCell = new StatisticsTableCell(
            category.getId(),
            blankMonth,
            category.getName(),
            onTableCellClicked
        );

        let monthTotals: Array<MonthTotal> = stat.getMonths();
        let monthTotalsMap = _.keyBy(monthTotals, _.method("getMonth"));

        let row: Array<DataTableCell> = _.map(months, (month: string) => {
            let monthTotal: MonthTotal = _.get(monthTotalsMap, month);
            let total: number = _.isNil(monthTotal) ? 0 : monthTotal.getTotal() as number;

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

    return { footer, header, rows } as TableData;
}

export default prepareData;
