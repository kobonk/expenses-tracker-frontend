import Vue from "vue";
import "./styles.sass";
import { retrieveExpenses, retrieveMonthStatistics, updateExpense } from "utils/restClient";
import { extractMonthName, getDaysOfMonth } from "utils/stringUtils";
import Expense from "types/Expense";
import MonthStatistics from "types/MonthStatistics";
import { ExpensesTableData } from "./ExpensesTable";
import { StatisticsTableData } from "./StatisticsTable";
import { component as dataTableComponent } from "./components/data-table/data-table";
import { component as graphComponent, GraphData, GraphInput } from "./components/graph/graph";

const _ = require("lodash");
const moment = require("moment");

const getMonths: Function = (numberOfMonths: number): Array<string> => {
    const currentMonth = moment();

    return _.map(Array.from(Array(numberOfMonths).keys()), (monthDifference: number) => {
        return currentMonth.clone().subtract(monthDifference, "months").format("YYYY-MM");
    });
};

const vm = new Vue({
    components: {
        "add-expense-form": () => import("./components/add-expense-form/add-expense-form"),
        "graph": graphComponent,
        "data-table": dataTableComponent
    },
    computed: {
        currentCategoryName(): string {
            if (_.isEmpty(this.expenses)) {
                return "";
            }

            return _.first(this.expenses).getCategory().getName()
        },
        currentMonth(): string {
            if (_.isEmpty(this.expenses)) {
                return "";
            }

            return _.first(this.expenses).getDate().replace(/-\d{2}$/, "");
        },
        currentMonthName(): string {
            if (_.isEmpty(this.expenses)) {
                return "";
            }

            return extractMonthName(_.first(this.expenses).getDate());
        },
        monthGraphData(): GraphData {
            let days: Array<String> = getDaysOfMonth(this.currentMonth);

            return {
                xTicks: _.map(days, (day: String) => day.slice(-2)),
                xTitles: days,
                xValues: _.chain(this.expenses)
                    .groupBy(_.method("getName"))
                    .mapValues((expenses: Array<Expense>) => {
                        return _.map(days, (day: string) => {
                            let expense: Expense = _.find(expenses, (expense: Expense) => expense.getDate() === day);

                            return _.isNil(expense) ? 0 : expense.getCost();
                        });
                    })
                    .map((values: Array<Number>, key: String): GraphInput => { return { name: key, values } as GraphInput; })
                    .value()
            } as GraphData
        }
    },
    data: {
        activeView: "months",
        expenses: [],
        expensesTableData: null,
        numberOfStatisticsMonths: 4,
        statistics: [],
        statisticsTableData: null
    },
    el: "#expenses-tracker",
    methods: {
        onCategoryMonthSelected(data: any) {
            if (!data.categoryId || !data.month) return;

            retrieveExpenses(data.categoryId, data.month)
            .then((expenses: Array<Expense>) => {
                this.updateExpensesView(expenses);
                this.activeView = "category-month"
            });
        },
        refreshMainView() {
            retrieveMonthStatistics(this.numberOfStatisticsMonths)
            .then((statistics: Array<MonthStatistics>) => {
                vm.statistics = statistics;

                vm.statisticsTableData = new StatisticsTableData(
                    getMonths(this.numberOfStatisticsMonths),
                    statistics,
                    this.onCategoryMonthSelected
                );

                if (!_.isEmpty(vm.expenses)) {
                    retrieveExpenses(_.first(vm.expenses).getCategory().getId(), vm.currentMonth)
                    .then((expenses: Array<Expense>) => vm.updateExpensesView(expenses));
                }
            })
        },
        showMonthsView() {
            this.activeView = "months";
        },
        updateExpense: async (expenseId: string, value: object) => {
            console.log(expenseId, value);
            await updateExpense(expenseId, value);
            await vm.refreshMainView();
        },
        updateExpensesView(expenses: Array<Expense>) {
            vm.expenses = expenses;
            vm.expensesTableData = new ExpensesTableData(expenses);
        }
    },
    mounted() {
        this.refreshMainView()
    }
});
