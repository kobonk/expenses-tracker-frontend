import Expense from "types/Expense";
import ExpenseCategory from "types/ExpenseCategory";
import ExpenseCategorySummary from "types/ExpenseCategorySummary";
import ExpenseCategoryTableGrid from "types/ExpenseCategoryTableGrid";
import MonthTotal from "types/MonthTotal";
import DataTableForCategories from "./DataTableForCategories";

const addExpenseToTotal = (expense : Expense, total : MonthTotal) : MonthTotal => {
    if (!total) {
        return new MonthTotal(expense.getMonth(), expense.getCost());
    }

    return new MonthTotal(total.getMonth(), total.getTotal() + expense.getCost());
};

const createEmptySummary = (category : ExpenseCategory, months : Array<string>) => {
    const monthTotals = months.map((month : string) => new MonthTotal(month, 0));

    return new ExpenseCategorySummary(category, monthTotals);
};

const convertExpensesToSummaries = (
    expenses : Array<Expense>,
    months : Array<string>,
    categories : Array<ExpenseCategory>
) : Array<ExpenseCategorySummary> => {
    const categoryMap = expenses.reduce(
        (accumulator : any, expense : Expense) => {
            const categoryId = expense.getCategory().getId();
            const categorySummary = (accumulator[categoryId] || createEmptySummary(expense.getCategory(), months)) as ExpenseCategorySummary;

            const monthTotal = categorySummary.getMonths().find((total : MonthTotal) => total.getMonth() === expense.getMonth()) as MonthTotal;
            const monthTotalIndex = categorySummary.getMonths().findIndex((total : MonthTotal) => total.getMonth() === expense.getMonth());
            
            const newTotal = addExpenseToTotal(expense, monthTotal);
            const totals = categorySummary.getMonths();
            const newTotals = [...totals.slice(0, monthTotalIndex), newTotal, ...totals.slice(monthTotalIndex + 1)];
            const newCategorySummary = new ExpenseCategorySummary(categorySummary.getCategory(), newTotals);

            return { ...accumulator, [categoryId]: newCategorySummary };
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
            return convertExpensesToSummaries(this.expenses, this.months, this.categories);
        },
        grid() {
            return new ExpenseCategoryTableGrid(convertExpensesToSummaries(this.expenses, this.months, this.categories), this.onMonthClicked);
        }
    },
    props: {
        categories: Array,
        expenses: Array,
        months: Array,
        onMonthClicked: Function
    },
    template: `
        <data-grid
            :grid="grid"
            :months="months"
            :onCellEdited="onMonthClicked"
            :rows="gridRows"
        >
        </data-grid>
    `
};
