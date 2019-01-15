import Vue from "vue";
import "./utils/i18n"
import addExpenseForm from "./components/add-expense-form/add-expense-form";
import statisticsTable from "./components/expense-statistics-table/expense-statistics-table";
import "./styles.sass"

const vm = new Vue({
    components: {
        "add-expense-form": addExpenseForm,
        "statistics-table": statisticsTable
    },
    el: "#expenses-tracker"
});
