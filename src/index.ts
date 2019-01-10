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

type Expense = {
    category: {
        id:string,
        name:string
    },
    cost:Number,
    name:string,
    purchase_date:string
};

type ExpenseFormTranslation = {
    title:string;
    expenseName:string;
    expenseCategory:string;
    expenseDate:string;
    expenseCost:string;
    submitButton:string;
}

type ExpenseFormData = {
    category:ExpenseCategory;
    cost:Number;
    date:string;
    i18n:ExpenseFormTranslation;
    matchingCategories:Array<ExpenseCategory>;
    name:string;
}

const formatDateString:Function = function(date:Date):string {
    let dateParts:Array<string> = [
        date.getFullYear() + "",
        date.getMonth() + 1 + "",
        date.getDate() + ""
    ];

    return dateParts.map((part) => part.length < 2 ? "0" + part : part).join("-");
}

const blankCategory:ExpenseCategory = new ExpenseCategory("blank", "blank");

const vm = new Vue({
    components: {
        autoCompleteField: autoCompleteField
    },
    data: {
        category: blankCategory,
        cost: null,
        date: formatDateString(new Date()),
        i18n: i18n.addExpenseForm,
        matchingCategories: [],
        name: ""
    },
    el: "#add-expense-form",
    methods: {
        filterCategories(name:string) {
            this.findCategories(name)
            .then(function(categories:Array<ExpenseCategory>) {
                vm.matchingCategories = categories;
            })
        },
        findCategories(name:string):Promise<Array<ExpenseCategory>> {
            if (_.isEmpty(_.trim(name))) {
                return new Promise<Array<ExpenseCategory>>((resolve:Function) => resolve([]));
            }

            return axios.get(`${ backendUrl }/categories`)
            .then(function(response:AxiosResponse<Object>):Array<ExpenseCategory> {
                return _.filter(
                    response.data,
                    (category:any) => {
                        return _.includes(_.toLower(category.name), _.toLower(_.trim(name)));
                    }
                )
                .map((category:any) => new ExpenseCategory(category.id, category.name));
            })
            .catch(function(error:Error):Array<any> {
                this.showToast(error);

                return [];
            });
        },
        onSubmit():Promise<any> {
            return this.ensureCategoryRegistration(this.category)
            .then((categoryId:string) => {
                let expense:Expense = {
                    category: {
                        id: categoryId,
                        name: this.category.getLabel()
                    },
                    cost: parseFloat(this.cost),
                    name: this.name,
                    purchase_date: this.date
                };

                return this.registerExpense(expense);
            });
        },
        ensureCategoryRegistration(category:ExpenseCategory):Promise<string> {
            if (!_.isNil(category.getId())) {
                return new Promise<string>((resolve:Function) => resolve(category.getId()));
            }

            return axios.post(`${ backendUrl }/categories`, { name: this.category.getLabel() })
            .then(function(response:AxiosResponse<Object>):string {
                this.showToast(`Category "${ response.data.name }" successfully registered!`);

                return response.data.id;
            });

        },
        registerExpense(expense:Expense) {
            axios.post(`${ backendUrl }/expense`, expense)
            .then(function(response:AxiosResponse<Object>) {
                this.showToast(`Expense "${ expense.name }" successfully registered!`);
            });
        },
        showToast(message:string) {
            console.log(message);
        }
    }
});
