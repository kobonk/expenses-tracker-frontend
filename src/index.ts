import Vue from "vue";
import "./styles.sass";
import { retrieveMonthStatistics } from "utils/restClient";
import { extractMonthName } from "utils/dataConversion";
import Expense from "types/Expense";
import MonthStatistics from "types/MonthStatistics";
import prepareExpensesTableData from "./expensesTableDataProvider";
import prepareStatisticsTableData from "./statisticsTableDataProvider";
import { component as dataTableComponent, TableData } from "./components/data-table/data-table";

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
        "graph": () => import("./components/graph/graph"),
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
        days(): Array<string> {
            let firstDay = moment(`${ this.currentMonth }-01`);
            let daysInMonth = firstDay.daysInMonth();

            return _.map(Array.from(Array(daysInMonth).keys()), (day: number) => {
                return firstDay.clone().add(day, "d").format("YYYY-MM-DD");
            });
        },
        dailyExpenseTotals(): Array<Array<any>> {
            let expensesByNameMap = _.groupBy(this.expenses, _.method("getName"));
            let totalsMap = _.mapValues(expensesByNameMap, (expenses: Array<Expense>) => {
                return _.map(this.days, (day: string) => {
                    let expense: Expense = _.find(expenses, (expense: Expense) => expense.getDate() === day);

                    return _.isNil(expense) ? 0 : expense.getCost();
                });
            });

            return _.map(totalsMap, (values: Array<number>, key: string) => _.concat([key], values));
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
