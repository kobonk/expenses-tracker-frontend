import Expense from "types/Expense";
import { ExpensesTableData } from "./../ExpensesTable";
import { extractMonthName, formatNumber } from "./../utils/stringUtils";
import DataTable from "./DataTable";

export default {
    components: {
        "data-table": DataTable
    },
    computed: {
        expensesMap() {
            if (!this.expenses || !Array.isArray(this.expenses) || this.expenses.length === 0) {
                return {};
            }

            const pattern = new RegExp(this.filterText, "gi");

            return this.expenses
                .reduce(
                    (accumulator : any, expense : Expense) => {
                        if (!pattern.test(expense.getName())) {
                            return accumulator;
                        }

                        const month = expense.getMonth();

                        if (Array.isArray(accumulator[month])) {
                            return { ...accumulator, [month]: [...accumulator[month], expense] };
                        }

                        return { ...accumulator, [month]: [expense] };
                    },
                    {}
                );
        }
    },
    methods: {
        createExpensesTableData(expenses: Array<Expense>): ExpensesTableData {
            return new ExpensesTableData(expenses);
        },
        displayMonth(month: string): string {
            return extractMonthName(month);
        },
        formatNumber: formatNumber
    },
    props: ["expenses", "filterText", "onEdit"],
    template: `
        <div>
            <div v-for="month in Object.keys(expensesMap).sort().reverse()" :key="month">
                <h2>{{ displayMonth(month) }} <small>({{ expensesMap[month].length }})</small></h2>
                <data-table
                    class="columns-3"
                    :data="createExpensesTableData(expensesMap[month])"
                    :on-cell-edited="onEdit">
                </data-table>
            </div>
        </div>
    `
};
