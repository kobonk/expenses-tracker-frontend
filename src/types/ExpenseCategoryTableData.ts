import Expense from "./Expense";

class ExpenseCategoryTableData {
    private expenses : Array<Expense>

    constructor(expenses : Array<Expense>) {
        this.expenses = expenses;
    }

    public getLeadingColumns() : DataTableData
}
