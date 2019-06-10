import Expense from "types/Expense";
import MonthStatistics from "types/MonthStatistics";
import MonthTotal from "types/MonthTotal";
import { StatisticsTableData } from "./../StatisticsTable";
import DataTable from "./DataTable";

const addExpenseToTotal = (expense : Expense, total : MonthTotal) : MonthTotal => {
    if (!total) {
        return new MonthTotal(expense.getMonth(), expense.getCost());
    }

    return new MonthTotal(total.getMonth(), total.getTotal() + expense.getCost());
};

const convertExpensesToStatistics = (expenses : Array<Expense>) : Array<MonthStatistics> => {
    const categoryMap = expenses.reduce(
        (accumulator : any, expense : Expense) => {
            const categoryId = expense.getCategory().getId();
            const statistics = accumulator[categoryId] || new MonthStatistics(expense.getCategory(), []);
            const monthTotal = statistics.getMonths().find((total : MonthTotal) => {
                return total.getMonth() === expense.getMonth();
            });

            const newTotal = addExpenseToTotal(expense, monthTotal);

            const totals = statistics.getMonths();
            const newTotals = [...totals.slice(0, totals.indexOf(monthTotal)), newTotal, ...totals.slice(totals.indexOf(monthTotal) + 1)];
            const newStatistics = new MonthStatistics(statistics.getCategory(), newTotals);

            return { ...accumulator, [categoryId]: newStatistics };
        },
        {}
    );

    return Object.keys(categoryMap)
        .reduce((accumulator : Array<MonthStatistics>, categoryId : string) => {
                return [...accumulator, categoryMap[categoryId]];
            },
            []
        );
};


export default {
    components: {
        "data-table": DataTable
    },
    computed: {
        tableData() {
            return new StatisticsTableData(
                this.monthNames,
                convertExpensesToStatistics(this.expenses),
                this.onMonthClicked
            );
        }
    },
    props: ["monthNames", "expenses", "onMonthClicked"],
    template: `
        <data-table
            :data="tableData">
        </data-table>
    `
};
