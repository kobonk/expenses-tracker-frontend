import Vue from "vue";
import "./styles.sass";
import { retrieveMonthStatistics } from "utils/restClient";
import MonthStatistics from "types/MonthStatistics";
import prepareStatisticsTableData from "./statisticsTableDataProvider";

const vm = new Vue({
    components: {
        "add-expense-form": () => import("./components/add-expense-form/add-expense-form"),
        "data-table": () => import("./components/data-table/data-table")
    },
    data: {
        numberOfStatisticsMonths: 4,
        statisticsTableData: {
            footer: [],
            header: [],
            rows: []
        }
    },
    el: "#expenses-tracker",
    methods: {
        updateStatistics() {
            retrieveMonthStatistics(this.numberOfStatisticsMonths)
            .then((statistics: Array<MonthStatistics>) => {
                vm.statisticsTableData = prepareStatisticsTableData(statistics, this.numberOfStatisticsMonths);
            })
        }
    },
    mounted() {
        this.updateStatistics()
    }
});
