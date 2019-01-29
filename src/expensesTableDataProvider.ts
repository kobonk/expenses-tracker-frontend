import Expense from "types/Expense";
import { TableData } from "./components/data-table/data-table";
import { formatNumber } from "utils/stringUtils";
import i18n from "utils/i18n";

const _ = require("lodash");

const prepareData: Function = (expenses: Array<Expense>): TableData => {
    let footer = _.concat(
        [i18n.expensesTable.totalLabel],
        formatNumber(
            _.reduce(
                expenses,
                (result: number, expense: Expense): number => result + expense.getCost(),
                0
            )
        ),
        [""]
    );

    let header = [i18n.expensesTable.expenseLabel, i18n.expensesTable.costLabel, i18n.expensesTable.dateLabel];
    let rows = _.map(expenses, (expense: Expense): Array<string> => {
        return [expense.getName(), formatNumber(expense.getCost()), expense.getDate()];
    })

    return { footer, header, rows } as TableData;
};

export default prepareData;
