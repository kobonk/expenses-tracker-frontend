import Vue from "vue";
import "./styles.sass";
import { retrieveCategories, retrieveExpenses, retrieveMonths, updateExpense } from "utils/restClient";
import { extractMonthName } from "utils/stringUtils";
import i18n from "utils/i18n";
import Expense from "types/Expense";
import ExpenseCategory from "types/ExpenseCategory";
import FilteredExpenses from "./components/FilteredExpenses";
import ViewTitle from "./components/ViewTitle";
import MonthFilterForm from "./components/MonthFilterForm";

const moment = require("moment");

const getMonths: Function = (startingMonth : string, numberOfMonths : number) : Array<string> => {
    const start = moment(startingMonth);

    return Array.from(Array(numberOfMonths).keys()).map((monthDifference: number) => {
        return start.clone().subtract(monthDifference, "months").format("YYYY-MM");
    });
};

const STARTING_MONTH = moment().format("YYYY-MM");
const NUMBER_OF_VISIBLE_MONTHS = 6;

const vm = new Vue({
    components: {
        "add-expense-form": () => import("./components/add-expense-form/add-expense-form"),
        "expense-category-month-view": () => import('./components/ExpenseCategoryMonthView'),
        "expense-category-table-view": () => import('./components/ExpenseCategoryTableView'),
        "filter-expenses-form": () => import("./components/FindExpensesForm"),
        "filtered-expenses": FilteredExpenses,
        "month-filter-form": MonthFilterForm,
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
        },
        numberOfVisibleMonths() : number {
            return this.visibleMonths.length;
        },
        selectedMonths() : Array<string> {
            let monthCount = 0;

            return this.availableMonths
                .reverse()
                .filter((month : string) => {
                    if (month === this.startingMonth || (monthCount >= 1 && monthCount < this.numberOfVisibleMonths)) {
                        monthCount += 1;
                        return true;
                    }

                    return false;
                });
        },
        startingMonth() : string {
            return this.visibleMonths[0];
        }
    },
    data: {
        activeView: "months",
        availableMonths: [],
        categories: [],
        currentCategory: null,
        currentMonth: null,
        expenses: [],
        filteredExpensesMap: null,
        filterText: "",
        visibleMonths: getMonths(STARTING_MONTH, NUMBER_OF_VISIBLE_MONTHS)
    },
    el: "#expenses-tracker",
    methods: {
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
        onMonthRangeChanged(months : Array<string>) {
            this.visibleMonths = months;
            this.refreshMainView();
        },
        refreshMainView() {
            retrieveMonths()
                .then((months : Array<string>) => {
                    this.availableMonths = months.includes(this.startingMonth) ? months : [...months, this.startingMonth];

                    return retrieveCategories();
                })
                .then((categories : Array<ExpenseCategory>) => {
                    this.categories = categories;

                    return retrieveExpenses(this.startingMonth, this.numberOfVisibleMonths)
                })
                .then((expenses : Array<Expense>) => {
                    this.expenses = expenses;
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
