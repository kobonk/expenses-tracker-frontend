import Vue from "vue";
import "./styles.sass";
import { retrieveExpenses, updateExpense } from "utils/restClient";
import { extractMonthName } from "utils/stringUtils";
import i18n from "utils/i18n";
import DataTable from "./components/DataTable";
import Expense from "types/Expense";
import FilteredExpenses from "./components/FilteredExpenses";
import ViewTitle from "./components/ViewTitle";

const moment = require("moment");

const getMonths: Function = (startingMonth : string, numberOfMonths : number) : Array<string> => {
    const start = moment(startingMonth);

    return Array.from(Array(numberOfMonths).keys()).map((monthDifference: number) => {
        return start.clone().subtract(monthDifference, "months").format("YYYY-MM");
    });
};

const vm = new Vue({
    components: {
        "add-expense-form": () => import("./components/add-expense-form/add-expense-form"),
        "expense-category-month-view": () => import('./components/ExpenseCategoryMonthView'),
        "expense-category-table-view": () => import('./components/ExpenseCategoryTableView'),
        "filter-expenses-form": () => import("./components/FilterExpensesForm"),
        "filtered-expenses": FilteredExpenses,
        "data-table": DataTable,
        "view-title": ViewTitle
    },
    computed: {
        currentCategoryName() : string {
            return this.currentCategory ? this.currentCategory.getName() : "";
        },
        currentMonthName() : string {
            return this.currentMonth ? extractMonthName(this.currentMonth) : "";
        },
        monthNames() : Array<string> {
            return getMonths(this.startingMonth, this.numberOfVisibleMonths);
        },
        currentTitle() : string {
            switch (this.activeView) {
                case "filtered-expenses":
                    return i18n.filterExpensesForm.resultTitle.replace("{FILTER_TEXT}", this.filterText);
                case "category-month":
                    return `${ this.currentMonthName } | ${ this.currentCategoryName }`;
                default:
                    return "";
            }
        }
    },
    data: {
        activeView: "months",
        currentCategory: null,
        currentMonth: null,
        expenses: [],
        filteredExpensesMap: null,
        filterText: "",
        numberOfVisibleMonths: 6,
        startingMonth: moment().format("YYYY-MM")
    },
    el: "#expenses-tracker",
    methods: {
        increaseMonths() {
            this.numberOfVisibleMonths += 1;
            this.refreshMainView();
        },
        displayFilteredExpenses(name: string) {
            this.filterText = name;
            this.activeView = "filtered-expenses";
        },
        onCategoryMonthSelected(data: any) {
            if (!data.category || !data.month) return;

            this.currentCategory = data.category;
            this.currentMonth = data.month;
            this.activeView = "category-month"
        },
        refreshMainView() {
            retrieveExpenses(this.startingMonth, this.numberOfVisibleMonths)
                .then((expenses : Array<Expense>) => {
                    vm.expenses = expenses;
                });
        },
        showMonthsView() {
            this.activeView = "months";
        },
        updateExpense: async (expenseId: string, value: object) => {
            await updateExpense(expenseId, value);

            const expenseIndex = vm.expenses.findIndex((expense : Expense) => {
                return expense.getId() === expenseId;
            });

            const expense = Expense.prototype.fromAsset({ ...vm.expenses[expenseIndex].toAsset(), ...value });

            vm.expenses = [...vm.expenses.slice(0, expenseIndex), expense, ...vm.expenses.slice(expenseIndex + 1)];
        }
    },
    mounted() {
        this.refreshMainView()
    }
});
