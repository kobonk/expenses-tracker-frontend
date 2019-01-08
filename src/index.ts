import Vue from "vue";
import { backendUrl, language } from "config";

const axios = require("axios");
const i18n = require(`./resources/i18n/${ language }.json`);
const _ = require("lodash");

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
    category:ExpenseCategory;
    categoryName:string;
    i18n:ExpenseFormTranslation;
    matchingCategories:Array<ExpenseCategory>;
}

const blankCategory:ExpenseCategory = { id: "blank", name: "blank" };

const data:ExpenseFormData = {
    category: blankCategory,
    categoryName: blankCategory.name,
    i18n: i18n.addExpenseForm,
    matchingCategories: []
};

const autoCompleteField = Vue.component("auto-complete-field", {
    props: ["value"],
    template: '<input type="text" :value="value" @input="$emit(\'value-changed\', $event.target.value)">'
});

const findCategories = function(name:string):Promise<Array<ExpenseCategory>> {
    return axios.get(`${ backendUrl }/categories`)
    .then(function(response:AxiosResponse<Object>):Array<ExpenseCategory> {
        return _.filter(response.data, (category:ExpenseCategory) => {
            return _.includes(_.toLower(category.name), _.toLower(_.trim(name)));
        });
    })
    .catch(function(error:Error):Array<any> {
        console.log(error);

        return [];
    });
};

const vm = new Vue({
    components: {
        autoCompleteField: autoCompleteField
    },
    created: function() {
        this.debouncedFindCategories = _.debounce(findCategories, 500);
    },
    data: data,
    el: "#add-expense-form",
    watch: {
        categoryName: function(newName:string, oldName:string) {
            findCategories(newName)
            .then(function(categories:Array<ExpenseCategory>) {
                vm.matchingCategories = categories;
            })
        }
    }
});
