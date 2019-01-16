import { autoCompleteField, ListItem } from "./../auto-complete-field/auto-complete-field";
import autoCompleteField2 from "./../auto-complete-field/auto-complete-field-2";
import { convertDateToString } from "utils/date";
import ExpenseCategory from "types/ExpenseCategory";
import Expense from "../../types/Expense";
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
        "auto-complete-field": autoCompleteField,
        "auto-complete-field-2": autoCompleteField2
    },
    data() {
        return {
            categories: <Array<ExpenseCategory>>[],
            category: blankCategory,
            categoryItem: new ExpenseCategoryListItem("", ""),
            cost: <Number>null,
            date: convertDateToString(new Date()),
            errorMessage: <string>null,
            i18n: i18n.addExpenseForm,
            matchingCategories: <Array<ExpenseCategoryListItem>>[],
            name: "",
            testNames: ["Jeden", "Dwa", "Trzy", "Cztery", "Pięć"],
            testName: "",
            toastMessage: <string>null
        }
    },
    methods: {
        convertToCategory(item:ListItem) {
            this.category = new ExpenseCategory(item.getId(), item.getLabel());
            this.filterCategories(item.getLabel());
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
        onExpenseRegistered() {
            this.category = blankCategory;
            this.categoryItem = new ExpenseCategoryListItem("", "");
            this.cost = null;
            this.date = convertDateToString(new Date());
            this.matchingCategories = [];
            this.name = "";
            this.$refs.form.reset();
        },
        onSubmit(event:any):Promise<any> {
            return this.ensureCategoryRegistration(this.category)
            .then((category:ExpenseCategory) => {
                let expense:Expense = new Expense(undefined, this.name, category, this.date, parseFloat(this.cost));

                return this.registerExpense(expense);
            })
            .then(() => {
                this.onExpenseRegistered();
                // Explicitly passing the event up the DOM tree. I don't know why it doesn't work out-of-box.
                this.$emit("submit", event);
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

                return registeredCategory;
            });

        },
        registerExpense(expense:Expense) {
            return persistExpense(expense)
            .then((expense:Expense) => {
                this.showMessage(_.replace(i18n.addExpenseForm.submitSuccessMessage, "{EXPENSE_NAME}", expense.getName()));
            });
        },
        showError(error:Error) {
            this.errorMessage = error.message;
            setTimeout(() => this.errorMessage = null, 4000);
        },
        showMessage(message:string) {
            this.toastMessage = message;
            setTimeout(() => this.toastMessage = null, 4000);
        }
    },
    template: `
        <form name="add-expense" class="add-expense-form" ref="form" @submit.prevent="onSubmit">
            <h3>{{ i18n.title }}</h3>
            <auto-complete-field-2
                v-model.lazy.trim="testName"
                :items="testNames">
            </auto-complete-field-2>
            <input autofocus tabindex="1" autocomplete="off" type="text" :placeholder="i18n.expenseName" name="name" required v-model="name">
            <auto-complete-field
                v-model.lazy.trim="categoryItem"
                :items="matchingCategories"
                :placeholder="i18n.expenseCategory"
                name="category"
                required
                tabindex="2">
            </auto-complete-field>
            <div v-if="category.getId() === null">{{ i18n.categoryNotFound }}</div>
            <input tabindex="3" type="date" :placeholder="i18n.expenseDate" name="purchase_date" required v-model="date">
            <input tabindex="4" autocomplete="off" type="number" :placeholder="i18n.expenseCost" name="cost" step="0.01" min="0.01" required v-model="cost">
            <button tabindex="5" type="submit" name="submit">{{ i18n.submitButton }}</button>
            <transition name="notification">
                <div class="notification" v-if="toastMessage">{{ toastMessage }}</div>
                <div class="notification notification-error" v-if="errorMessage">{{ errorMessage }}</div>
            </transition>
        </form>
    `,
    watch: {
        categoryItem(item:ListItem) {
            this.convertToCategory(item);
        },
        testName(name:String) {
            console.log("testName:", name);
        }
    }
};

export default component;
