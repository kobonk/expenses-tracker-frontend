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
        dailyExpenses(): any {
            return _.reduce(
                this.days,
                (result: any, day: string) => {
                    return _.assign(
                        {},
                        result,
                        { [day]: _.filter(this.expenses, (expense: Expense) => expense.getDate() === day) }
                    )
                },
                {}
            );
        },
        dailyTotals(): Array<number> {
            return _.map(this.days, (day: string) => {
                let expenses: Array<Expense> = _.get(this.dailyExpenses, day);

                if (_.isEmpty(expenses)) {
                    return 0;
                }

                return _.reduce(expenses, (result: number, expense: Expense) => { return result + expense.getCost() }, 0);
            })
        },
        days(): Array<string> {
            let firstDay = moment(`${ this.currentMonth }-01`);
            let daysInMonth = firstDay.daysInMonth();

            return _.map(Array.from(Array(daysInMonth).keys()), (day: number) => {
                return firstDay.clone().add(day, "d").format("YYYY-MM-DD");
            });
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
