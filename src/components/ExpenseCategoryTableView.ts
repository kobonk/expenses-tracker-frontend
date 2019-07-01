import Expense from "types/Expense";
import ExpenseCategory from "types/ExpenseCategory";
import ExpenseCategorySummary from "types/ExpenseCategorySummary";
import MonthTotal from "types/MonthTotal";
import DataTableForCategories from "./DataTableForCategories";

const addExpenseToTotal = (expense : Expense, total : MonthTotal) : MonthTotal => {
    if (!total) {
        return new MonthTotal(expense.getMonth(), expense.getCost());
    }

    return new MonthTotal(total.getMonth(), total.getTotal() + expense.getCost());
};

const convertExpensesToStatistics = (
    expenses : Array<Expense>,
    categories : Array<ExpenseCategory>
) : Array<ExpenseCategorySummary> => {
    const categoryMap = expenses.reduce(
        (accumulator : any, expense : Expense) => {
            const categoryId = expense.getCategory().getId();
            const statistics = accumulator[categoryId] || new ExpenseCategorySummary(expense.getCategory(), []);
            const monthTotal = statistics.getMonths().find((total : MonthTotal) => {
                return total.getMonth() === expense.getMonth();
            });

            const newTotal = addExpenseToTotal(expense, monthTotal);

            const totals = statistics.getMonths();
            const newTotals = [...totals.slice(0, totals.indexOf(monthTotal)), newTotal, ...totals.slice(totals.indexOf(monthTotal) + 1)];
            const newStatistics = new ExpenseCategorySummary(statistics.getCategory(), newTotals);

            return { ...accumulator, [categoryId]: newStatistics };
        },
        {}
    );

    return Object.keys(categoryMap)
        .reduce((accumulator : Array<ExpenseCategorySummary>, categoryId : string) => {
                return [...accumulator, categoryMap[categoryId]];
            },
            []
        );
};


export default {
    components: {
        "data-grid": DataTableForCategories
    },
    computed: {
        gridRows() {
            return convertExpensesToStatistics(this.expenses, this.categories);
        }
    },
    props: {
        categories: Array,
        expenses: Array,
        monthNames: Array,
        onMonthClicked: Function
    },
    template: `
        <data-grid
            :months="monthNames"
            :onCellEdited="onMonthClicked"
            :rows="gridRows"
        >
        </data-grid>
    `
};
