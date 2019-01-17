import autoCompleteField from "../auto-complete-field/auto-complete-field";
import { convertDateToString } from "utils/date";
import ExpenseCategory from "types/ExpenseCategory";
import Expense from "types/Expense";
import i18n from "utils/i18n";
import { persistCategory, persistExpense, retrieveCategories, retrieveSimilarExpenseNames } from "utils/restClient";
import "./styles.sass";

const _ = require("lodash");

const trimAndLower = (text: string): string => {
    return _.toLower(_.trim(text));
};

const component: Vue.Component = {
    components: {
        "auto-complete-field": autoCompleteField
    },
    computed: {
        categoryNames(): Array<ExpenseCategory> {
            return _.map(this.categories, _.method("getName")) as Array<ExpenseCategory>;
        }
    },
    data() {
        return {
            categories: [] as Array<ExpenseCategory>,
            categoryName: "",
            cost: null as unknown,
            date: convertDateToString(new Date()),
            errorMessage: null as unknown,
            i18n: i18n.addExpenseForm,
            name: "",
            similarNames: [] as Array<string>,
            toastMessage: null as unknown
        };
    },
    methods: {
        onExpenseRegistered() {
            this.categoryName = "";
            this.cost = null;
            this.date = convertDateToString(new Date());
            this.name = "";
            this.$refs.form.reset();
        },
        onSubmit(event: any): Promise<any> {
            return this.ensureCategoryRegistration(this.categoryName)
            .then((category: ExpenseCategory) => {
                let expense: Expense = new Expense(undefined, this.name, category, this.date, parseFloat(this.cost));

                return this.registerExpense(expense);
            })
            .then(() => {
                this.onExpenseRegistered();
                // Explicitly passing the event up the DOM tree. I don't know why it doesn't work out-of-box.
                this.$emit("submit", event);
            });
        },
        ensureCategoryRegistration(categoryName: string): Promise<ExpenseCategory> {
            let existingCategory: ExpenseCategory = this.findCategoryByName(categoryName);

            if (!_.isNil(existingCategory)) {
                return new Promise((reject: Function) => reject(existingCategory)) as Promise<ExpenseCategory>;
            }

            return this.updateCategories()
            .then(() => {
                let matchingCategory: ExpenseCategory = this.findCategoryByName(categoryName);

                if (!_.isNil(matchingCategory)) {
                    return matchingCategory;
                }

                return this.registerCategory(categoryName);
            });
        },
        findCategoryByName(categoryName: string): ExpenseCategory {
            return _.find(this.categories, (category: ExpenseCategory) => {
                return trimAndLower(category.getName()) === trimAndLower(categoryName);
            });
        },
        registerCategory(categoryName: string): Promise<ExpenseCategory> {
            return persistCategory(categoryName)
            .then((persistedCategories: Array<ExpenseCategory>): ExpenseCategory => {
                this.categories = persistedCategories;

                return this.findCategoryByName(categoryName);
            });
        },
        registerExpense(expense: Expense) {
            return persistExpense(expense)
            .then((expense: Expense) => {
                this.showMessage(_.replace(i18n.addExpenseForm.submitSuccessMessage, "{EXPENSE_NAME}", expense.getName()));
            });
        },
        showError(error: Error) {
            this.errorMessage = error.message;
            setTimeout(() => (this.errorMessage = null), 4000);
        },
        showMessage(message: string) {
            this.toastMessage = message;
            setTimeout(() => (this.toastMessage = null), 4000);
        },
        updateCategories(): Promise<any> {
            return retrieveCategories()
            .then((categories: Array<ExpenseCategory>) => {
                this.categories = categories;
            })
            .catch((error: Error) => {
                this.showError(error);
            });
        }
    },
    mounted() {
        this.updateCategories();
    },
    template: `
        <form name="add-expense" class="add-expense-form" ref="form" @submit.prevent="onSubmit">
            <h3>{{ i18n.title }}</h3>
            <auto-complete-field
                v-model.lazy="name"
                :items="similarNames"
                :placeholder="i18n.expenseName"
                autofocus
                name="name"
                required
                tabindex="1">
            </auto-complete-field>
            <auto-complete-field
                v-model.lazy="categoryName"
                :items="categoryNames"
                :placeholder="i18n.expenseCategory"
                name="category"
                required
                tabindex="2">
            </auto-complete-field>
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
        name(expenseName: string) {
            if (_.isEmpty(expenseName)) {
                return;
            }

            retrieveSimilarExpenseNames(expenseName)
            .then((names: Array<string>) => this.similarNames = names)
            .catch((error: Error) => {
                this.showError(error);
            });
        }
    }
};

export default component;
