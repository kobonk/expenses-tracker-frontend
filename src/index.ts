import Vue from "vue";
import "./styles.sass";
import { retrieveMonthStatistics } from "utils/restClient";
import MonthStatistics from "types/MonthStatistics";
import { prepareData as prepareStatisticsTableData } from "./statisticsTableDataProvider";
import { component as dataTableComponent, TableData } from "./components/data-table/data-table";

const vm = new Vue({
    components: {
        "add-expense-form": () => import("./components/add-expense-form/add-expense-form"),
        "data-table": dataTableComponent
    },
    data: {
        numberOfStatisticsMonths: 4,
        statisticsTableData: {
            footer: [],
            header: [],
            rows: []
        } as TableData
    },
    el: "#expenses-tracker",
    methods: {
        updateStatistics() {
            retrieveMonthStatistics(this.numberOfStatisticsMonths)
            .then((statistics: Array<MonthStatistics>) => {
                vm.statisticsTableData = prepareStatisticsTableData(
                    statistics,
                    this.numberOfStatisticsMonths,
                    this.onTableCellClicked
                );
            })
        },
        onTableCellClicked(data: any) {
            console.log(data);
        }
    },
    mounted() {
        this.updateStatistics()
    }
});
