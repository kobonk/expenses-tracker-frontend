import i18n from 'utils/i18n';
import ExpenseCategory from "types/ExpenseCategory";
import MonthStatistics from "types/MonthStatistics";
import MonthTotal from "types/MonthTotal";
import { formatNumber } from "utils/dataConversion";
import { DataTableCell } from "./components/data-table/data-table";

const _ = require("lodash");

const decimalPoints = 2;
const blankMonth = "9999-12"

type StatisticsTableData = {
    footer: Array<string | Number>,
    header: Array<string | Number>,
    rows: Array<Array<string | Number | DataTableCell>>
};

class StatisticsTableCell implements DataTableCell {
    private categoryId: string;
    private month: string;
    private content: string;

    constructor(categoryId: string, month: string, content: string) {
        this.categoryId = categoryId;
        this.month = month;
        this.content = content;
    }

    public getContent(): string {
        return this.content;
    }

    public onClick() {
        console.log(this.content, this.month, this.categoryId);
    }
}

const createFakeCell: Function = (category: ExpenseCategory, total: number): DataTableCell => {
    return new StatisticsTableCell(category.getId(), blankMonth, formatNumber(total, decimalPoints));
}

const getMonthNames: Function = (statistics: Array<MonthStatistics>, numberOfMonths: number): Array<string> => {
    let rowWithGreatestMonthNumber = _.last(_.sortBy(statistics, (row: MonthStatistics) => row.getMonths().length))
    let availableMonthNames = _.map(rowWithGreatestMonthNumber.getMonths(), _.method("getMonthName"));
    let lackingMonths = _.fill(new Array(numberOfMonths - availableMonthNames.length), "n/a");

    return _.concat(availableMonthNames, lackingMonths)
};

const getRows: Function = (statistics: Array<MonthStatistics>, numberOfMonths: number): Array<Array<DataTableCell>> => {
    return _.map(statistics, (stat: MonthStatistics) => {
        let category: ExpenseCategory = stat.getCategory();
        let categoryCell: DataTableCell = new StatisticsTableCell(category.getId(), blankMonth, category.getName());

        let row: Array<DataTableCell> = _.map(stat.getMonths(), (month: MonthTotal): DataTableCell => {
            return new StatisticsTableCell(category.getId(), month.getMonth(), month.getFormattedTotal(decimalPoints))
        });

        let fillValue: DataTableCell = createFakeCell(stat.getCategory(), 0);

        return _.concat([categoryCell], row, _.fill(new Array(Math.abs(numberOfMonths - row.length)), fillValue));
    });
};

const getTotals: Function = (statistics: Array<MonthStatistics>, numberOfMonths: number): Array<number> => {
    if (_.isEmpty(statistics)) {
        return [];
    }

    let initialTable = _.fill(new Array(numberOfMonths), 0);

    return _.reduce(
        statistics,
        (result: Array<number>, row: MonthStatistics) => {
            let monthTotals: Array<number> = _.map(row.getMonths(), (month: MonthTotal) => month.getTotal());

            return _.map(result, (total: number, index: number) => total + _.get(monthTotals, index, 0));
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

const prepareData: Function = (statistics: Array<MonthStatistics>, numberOfMonths: Number): StatisticsTableData => {
    let footer = _.concat([i18n.statisticsTable.totalLabel], _.map(getTotals(statistics, numberOfMonths), formatNumericCell));
    let header = _.concat([i18n.statisticsTable.categoryLabel], getMonthNames(statistics, numberOfMonths as number));
    let rows = getRows(statistics, numberOfMonths);

    return { footer, header, rows } as StatisticsTableData;
}

export { prepareData, StatisticsTableData };
