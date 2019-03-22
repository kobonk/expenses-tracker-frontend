import { ExpenseDataTableCellNumber, ExpenseDataTableCellString } from "./expensesTableTypes";
import Expense from "types/Expense";
import { DataTableCell, TableData } from "./components/data-table/data-table";
import { formatNumber } from "utils/stringUtils";
import i18n from "utils/i18n";

const _ = require("lodash");

const getRows: Function = (expenses: Array<Expense>): Array<Array<DataTableCell>> => {
    return _.map(expenses, (expense: Expense): Array<DataTableCell> => {
        const onClick = (id: string, value: string | number) => console.log(id, value);

        return [
            new ExpenseDataTableCellString(expense.getId(), expense.getName(), onClick),
            new ExpenseDataTableCellNumber(expense.getId(), expense.getCost(), onClick),
            new ExpenseDataTableCellString(expense.getId(), expense.getDate(), onClick)
        ];
    });
};

const prepareData: Function = (expenses: Array<Expense>): TableData => {
    const footer = _.concat(
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

    const header = [i18n.expensesTable.expenseLabel, i18n.expensesTable.costLabel, i18n.expensesTable.dateLabel];
    const rows = getRows(expenses);

    return { footer, header, rows } as TableData;
};

export default prepareData;
