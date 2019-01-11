import Vue from "vue";
import { autoCompleteField, ListItem } from "./../auto-complete-field/auto-complete-field";
import { convertDateToString } from "utils/date";
import { backendUrl } from "config";
import ExpenseCategory from "types/ExpenseCategory";
import Expense from '../../types/Expense';
import i18n from "utils/i18n";
import { persistCategory, persistExpense, retrieveCategories } from "utils/restClient";
import "./styles.sass"

const _ = require("lodash");

class ExpenseCategoryListItem extends ExpenseCategory implements ListItem {
    public getLabel():string {
        return this.getName();
    }
};

const blankCategory:ExpenseCategory = new ExpenseCategory("blank", "blank");

const component = {
    components: {
        "auto-complete-field": autoCompleteField
    },
    data() {
        return {
            categories: <Array<ExpenseCategory>>[],
            category: blankCategory,
            cost: <Number>null,
            date: convertDateToString(new Date()),
            i18n: i18n.addExpenseForm,
            matchingCategories: <Array<ExpenseCategoryListItem>>[],
            name: ""
        }
    },
    methods: {
        convertToCategory(item:ListItem) {
            this.category = new ExpenseCategory(item.getId(), item.getLabel());
        },
        filterCategories(name:string) {
            if (_.isEmpty(_.trim(name))) {
                this.matchingCategories = [];
                return;
            }

            this.getCategories()
            .then((categories:Array<ExpenseCategory>) => {
                this.matchingCategories = _.filter(categories, (category:ExpenseCategory): Array<ExpenseCategoryListItem> => {
                    return _.includes(_.toLower(category.getName()), _.toLower(_.trim(name)));
                })
                .map((category:ExpenseCategory) => new ExpenseCategoryListItem(category.getId(), category.getName()));
            });
        },
        getCategories():Promise<Array<ExpenseCategory>> {
            if (!_.isEmpty(this.categories)) {
                return new Promise<Array<ExpenseCategory>>((resolve:Function) => resolve(this.categories));
            }

            return this.retrieveCategories();
        },
        retrieveCategories():Promise<Array<ExpenseCategory>> {
            return retrieveCategories()
            .catch((error:Error):Array<any> => {
                this.showError(error);

                return [];
            });
        },
        onSubmit():Promise<any> {
            return this.ensureCategoryRegistration(this.category)
            .then((category:ExpenseCategory) => {
                let expense:Expense = new Expense(undefined, this.name, category, this.date, parseFloat(this.cost));

                return this.registerExpense(expense);
            });
        },
        ensureCategoryRegistration(category:ExpenseCategory):Promise<ExpenseCategory> {
            return this.retrieveCategories()
            .then((categories:Array<ExpenseCategory>) => {
                this.categories = categories;

                let matchingCategory:ExpenseCategory = _.find(categories, (registeredCategory:ExpenseCategory) => {
                    return _.trim(registeredCategory.getName()) === _.trim(category.getName())
                });

                if (!_.isNil(matchingCategory)) {
                    return matchingCategory;
                }

                return this.registerCategory(category);
            });
        },
        registerCategory(category:ExpenseCategory):Promise<ExpenseCategory> {
            return persistCategory(category)
            .then((persistedCategories:Array<ExpenseCategory>):ExpenseCategory => {
                this.categories = persistedCategories;

                let registeredCategory:ExpenseCategory = _.find(persistedCategories, (persistedCategory:ExpenseCategory) => {
                    return persistedCategory.getName() === category.getName()
                });

                this.showToast(`Category "${ registeredCategory.getName() }" successfully registered!`);

                return registeredCategory;
            });

        },
        registerExpense(expense:Expense) {
            return persistExpense(expense)
            .then((expense:Expense) => {
                this.showToast(`Expense "${ expense.getName() }" successfully registered!`);
            });
        },
        showError(error:Error) {
            console.error(error);
        },
        showToast(message:string) {
            console.log(message);
        }
    },
    template: `
        <form name="add-expense" class="add-expense-form" @submit.stop.prevent="onSubmit">
            <h3>{{ i18n.title }}</h3>
            <input tabindex="1" autocomplete="off" type="text" :placeholder="i18n.expenseName" name="name" required v-model="name">
            <br>
            <auto-complete-field
                name="category"
                @input="convertToCategory($event)"
                :on-value-change="filterCategories"
                :items="matchingCategories"
                :placeholder="i18n.expenseCategory"
                :required="true"
                :tabindex="2">
            </auto-complete-field>
            <div v-if="category.getId() === null">{{ i18n.categoryNotFound }}</div>
            <input tabindex="3" type="date" :placeholder="i18n.expenseDate" name="purchase_date" required v-model="date">
            <br>
            <input tabindex="4" autocomplete="off" type="number" :placeholder="i18n.expenseCost" name="cost" step="0.01" min="0.01" required v-model="cost">
            <br>
            <button tabindex="5" type="submit" name="submit">{{ i18n.submitButton }}</button>
        </form>
    `
};

export default component;
