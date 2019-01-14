import Vue from "vue";
import "./utils/i18n"
import addExpenseForm from "./components/add-expense-form/add-expense-form";
import "./styles.sass"

const vm = new Vue({
    components: {
        "add-expense-form": addExpenseForm
    },
    el: "#expenses-tracker"
});
