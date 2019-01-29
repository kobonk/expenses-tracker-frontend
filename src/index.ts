import Vue from "vue";
import "./styles.sass";
import { retrieveMonthStatistics } from "utils/restClient";
import { extractMonthName, getDaysOfMonth } from "utils/stringUtils";
import Expense from "types/Expense";
import MonthStatistics from "types/MonthStatistics";
import prepareExpensesTableData from "./expensesTableDataProvider";
import prepareStatisticsTableData from "./statisticsTableDataProvider";
import { component as dataTableComponent, TableData } from "./components/data-table/data-table";
import { component as graphComponent, GraphData, GraphInput } from "./components/graph/graph";

const _ = require("lodash");
const moment = require("moment");

const blankTableData = {
    footer: [],
    header: [],
    rows: []
} as TableData

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
        expenses: [],
        expensesTableData: blankTableData,
        numberOfStatisticsMonths: 4,
        statistics: [],
        statisticsTableData: blankTableData
    },
    el: "#expenses-tracker",
    methods: {
        clearExpensesTableData() {
            vm.expensesTableData = blankTableData;
        },
        updateStatistics() {
            retrieveMonthStatistics(this.numberOfStatisticsMonths)
            .then((statistics: Array<MonthStatistics>) => {
                vm.statistics = statistics;

                vm.statisticsTableData = prepareStatisticsTableData(
                    statistics,
                    this.numberOfStatisticsMonths,
                    this.onTableCellClicked
                );
            })
        },
        onTableCellClicked(expenses: Array<Expense>) {
            vm.expenses = expenses;
            vm.expensesTableData = prepareExpensesTableData(expenses);
        }
    },
    mounted() {
        this.updateStatistics()
    }
});
