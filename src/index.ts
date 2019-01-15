import Vue from "vue";
import "./utils/i18n"
import "./styles.sass"

const vm = new Vue({
    components: {
        "add-expense-form": () => import("./components/add-expense-form/add-expense-form"),
        "statistics-table": () => import("./components/expense-statistics-table/expense-statistics-table")
    },
    el: "#expenses-tracker"
});
