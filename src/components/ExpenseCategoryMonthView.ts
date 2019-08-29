import { extractMonthName } from "utils/stringUtils";
import Expense from "types/Expense";
import { ExpensesTableData } from "./../ExpensesTable";
import DataTable from "./DataTable";

export default {
    components: {
        "data-table": DataTable
    },
    computed: {
        categoryName() {
            this.category.getName()
        },
        monthName() {
            extractMonthName(this.month);
        },
        tableData() {
            const monthlyExpenses = this.expenses.filter((expense : Expense) => {
                return expense.getCategory().getId() === this.category.getId() && expense.getMonth() === this.month;
            });

            return new ExpensesTableData(monthlyExpenses);
        }
    },
    props: ["category", "expenses", "month", "onExpenseEdited"],
    template: `
        <data-table
            class="align-right align-first-column-left align-second-column-left data-table-flex"
            :on-cell-edited="onExpenseEdited"
            :data="tableData"
        />
    `
}
