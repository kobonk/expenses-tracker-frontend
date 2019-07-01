import i18n from 'utils/i18n';
import Expense from "types/Expense";
import ExpenseCategory from "types/ExpenseCategory";
import ExpenseCategorySummary from "types/ExpenseCategorySummary";
import MonthTotal from "types/MonthTotal";
import { extractMonthName, formatNumber } from "utils/stringUtils";
import { DataTableData, DataTableRecord, DataTableRecordCollection } from "./../types/DataTableTypes";

const _ = require("lodash");
const moment = require("moment");

export default class ExpenseCategoryTableGrid {
    private months : Array<string>;
    private categories : Array<ExpenseCategory>;
    private expenses: Array<Expense>;
    private onTableCellClicked : Function;
    private grid : Array<Array<any>>

    constructor(
        months : Array<string>,
        categories : Array<ExpenseCategory>,
        expenses: Array<Expense>,
        onTableCellClicked : Function
    ) {
        this.months = months;
        this.categories = categories;
        this.expenses = expenses;
        this.onTableCellClicked = onTableCellClicked;
    }

    getColumn(index : number) {

    }
};
