import Vue from "vue";
import { autoCompleteField, ListItem } from "./components/auto-complete-field/auto-complete-field"
import { backendUrl, language } from "config";
import "./style.sass"
import { threadId } from "worker_threads";

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
        categories: [],
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
            if (_.isEmpty(_.trim(name))) {
                vm.matchingCategories = [];
                return;
            }

            this.getCategories()
            .then((categories:Array<ExpenseCategory>) => {
                vm.matchingCategories = _.filter(
                    categories,
                    (category:ExpenseCategory) => {
                        return _.includes(_.toLower(category.getLabel()), _.toLower(_.trim(name)));
                    }
                )
            })
            .catch(vm.showToast);
        },
        getCategories():Promise<Array<ExpenseCategory>> {
            if (!_.isEmpty(this.categories)) {
                return new Promise<Array<ExpenseCategory>>((resolve:Function) => resolve(this.categories));
            }

            return this.retrieveCategories();
        },
        retrieveCategories():Promise<Array<ExpenseCategory>> {
            return axios.get(`${ backendUrl }/categories`)
            .then((response:AxiosResponse<Object>):Array<ExpenseCategory> => {
                return _.map(response.data, vm.deserializeCategory);
            })
            .then((categories:Array<ExpenseCategory>) => {
                return vm.categories = categories;
            })
            .catch((error:Error):Array<any> => {
                vm.showToast(error);

                return [];
            });
        },
        deserializeCategory(categoryAsset:any):ExpenseCategory {
            return new ExpenseCategory(categoryAsset.id, categoryAsset.name);
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

            return this.retrieveCategories()
            .then((categories:Array<ExpenseCategory>) => {
                vm.categories = categories;

                let matchingCategory = _.find(categories, (registeredCategory:ExpenseCategory) => {
                    return _.trim(registeredCategory.getLabel()) === _.trim(category.getLabel())
                });

                if (!_.isNil(matchingCategory)) {
                    return matchingCategory.getId();
                }

                return vm.registerCategory(category)
                .then((category:ExpenseCategory) => {
                    return category.getId();
                })
            });
        },
        registerCategory(category:ExpenseCategory):Promise<ExpenseCategory> {
            return axios.post(`${ backendUrl }/categories`, { name: this.category.getLabel() })
            .then((response:AxiosResponse<Object>):ExpenseCategory => {
                vm.categories = _.map(response.data, vm.deserializeCategory);

                let registeredCategory:ExpenseCategory = _.find(
                    vm.categories,
                    (oneOfCategories:ExpenseCategory) => oneOfCategories.getLabel() === category.getLabel()
                );

                vm.showToast(`Category "${ registeredCategory.getLabel() }" successfully registered!`);

                return registeredCategory;
            });

        },
        registerExpense(expense:Expense) {
            axios.post(`${ backendUrl }/expense`, expense)
            .then((response:AxiosResponse<Object>) => {
                vm.showToast(`Expense "${ expense.name }" successfully registered!`);
            });
        },
        showToast(message:string) {
            console.log(message);
        }
    }
});
