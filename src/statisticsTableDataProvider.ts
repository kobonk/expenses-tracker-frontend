import i18n from 'utils/i18n';
import MonthStatistics from "types/MonthStatistics";
import MonthTotal from "types/MonthTotal";
import { formatNumber } from "utils/dataConversion";

const _ = require("lodash");

type StatisticsTableData = {
    footer: Array<String | Number>,
    header: Array<String | Number>,
    rows: Array<Array<String | Number>>
};

const decimalPoints = 2;

const getMonthNames: Function = (statistics: Array<MonthStatistics>, numberOfMonths: number): Array<String> => {
    let rowWithGreatestMonthNumber = _.last(_.sortBy(statistics, (row: MonthStatistics) => row.getMonths().length))
    let availableMonthNames = _.map(rowWithGreatestMonthNumber.getMonths(), _.method("getMonthName"));
    let lackingMonths = _.fill(new Array(numberOfMonths - availableMonthNames.length), "n/a");

    return _.concat(availableMonthNames, lackingMonths)
};

const getRows: Function = (statistics: Array<MonthStatistics>, numberOfMonths: number): Array<Array<String>> => {
    return _.map(statistics, (stat: MonthStatistics) => {
        let row: Array<String> = _.map(stat.getMonths(), (month: MonthTotal): String => month.getFormattedTotal(decimalPoints));
        let fillValue: String = formatNumericCell(0);

        return _.concat([stat.getCategoryName()], row, _.fill(new Array(Math.abs(numberOfMonths - row.length)), fillValue));
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

const formatNumericCell: Function = (cellValue: String | Number | null | undefined): String => {
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

export default prepareData;
