import Vue from "vue";
import { backendUrl, language } from "config";
const axios = require("axios");
const translation = require(`./resources/i18n/${ language }.json`);

type ExpenseCategory = {
    id:string;
    name:string;
};

type ExpenseFormTranslation = {
    title:string;
    name:string;
    category:string;
    date:string;
    cost:string;
    submit:string;
}

type ExpenseFormData = {
    i18n:ExpenseFormTranslation
    categories:Array<ExpenseCategory>
}

const data:ExpenseFormData = {
    i18n: translation.addExpenseForm,
    categories: []
};

const vm = new Vue({
    el: "#add-expense-form",
    data: data,
    methods: {}
});

axios.get(`${ backendUrl }/categories`)
.then(function(response:AxiosResponse<Object>) {
    data.categories = response.data;
});
