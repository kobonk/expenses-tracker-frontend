import Vue from "vue";
import { autoCompleteField, ListItem } from "./components/auto-complete-field/auto-complete-field"
import { backendUrl, language } from "config";

const axios = require("axios");
const i18n = require(`./resources/i18n/${ language }.json`);
const _ = require("lodash");

class ExpenseCategory implements ListItem {
    private id:string;
    private label:string;

    constructor(id:string, label:string) {
        this.id = id;
        this.label = label;
    }

    public getLabel() {
        return this.label;
    }

    public getId() {
        return this.id;
    }
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

const blankCategory:ExpenseCategory = new ExpenseCategory("blank", "blank");

const data:ExpenseFormData = {
    category: blankCategory,
    categoryName: blankCategory.getLabel(),
    i18n: i18n.addExpenseForm,
    matchingCategories: []
};

const findCategories = function(name:string):Promise<Array<ExpenseCategory>> {
    if (_.isEmpty(_.trim(name))) {
        return new Promise<Array<ExpenseCategory>>((resolve:Function) => resolve([]));
    }

    return axios.get(`${ backendUrl }/categories`)
    .then(function(response:AxiosResponse<Object>):Array<ExpenseCategory> {
        return _.filter(response.data, (category:any) => {
            return _.includes(_.toLower(category.name), _.toLower(_.trim(name)));
        })
        .map((category:any) => new ExpenseCategory(category.id, category.name));
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
    methods: {
        filterCategories: function(name:string) {
            findCategories(name)
            .then(function(categories:Array<ExpenseCategory>) {
                vm.matchingCategories = categories;
            })
        }
    }
});
