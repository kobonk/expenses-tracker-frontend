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

const blankTableData = {
    footer: [],
    header: [],
    rows: []
} as TableData

const vm = new Vue({
    components: {
        "add-expense-form": () => import("./components/add-expense-form/add-expense-form"),
        "data-table": dataTableComponent
    },
    computed: {
        currentCategoryName(): string {
            if (_.isEmpty(this.expenses)) {
                return "";
            }

            return _.first(this.expenses).getCategory().getName()
        },
        currentMonthName(): string {
            if (_.isEmpty(this.expenses)) {
                return "";
            }

            return extractMonthName(_.first(this.expenses).getDate());
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
