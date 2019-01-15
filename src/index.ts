import Vue from "vue";
import "./styles.sass";
import { retrieveMonthStatistics } from "utils/restClient";
import MonthStatistics from "types/MonthStatistics";

const vm = new Vue({
    components: {
        "add-expense-form": () => import("./components/add-expense-form/add-expense-form"),
        "statistics-table": () => import("./components/expense-statistics-table/expense-statistics-table")
    },
    data: {
        statisticsTableRows: [],
        numberOfStatisticsMonths: 4
    },
    el: "#expenses-tracker",
    methods: {
        updateStatistics() {
            retrieveMonthStatistics(this.numberOfStatisticsMonths)
            .then((statistics:Array<MonthStatistics>) => {
                vm.statisticsTableRows = statistics;
            })
        }
    },
    mounted() {
        this.updateStatistics()
    }
});
