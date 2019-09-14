import AutoCompleteField from "../AutoCompleteField";
import { convertDateToString } from "utils/stringUtils";
import ExpenseCategory from "types/ExpenseCategory";
import Expense from "types/Expense";
import ExpenseTag from "types/ExpenseTag";
import i18n from "utils/i18n";

import {
    persistCategory,
    persistExpense,
    retrieveCategories,
    retrieveSimilarExpenseNames,
    retrieveCommonExpenseCost,
    retrieveTags
} from "utils/restClient";

import "./styles.sass";
import ExpenseTagsField from "./../ExpenseTagsField";

const _ = require("lodash");

const trimAndLower = (text: string): string => {
    return _.toLower(_.trim(text));
};

const component = {
    components: {
        "auto-complete-field": AutoCompleteField,
        "tags-field": ExpenseTagsField
    },
    computed: {
        categoryNames(): Array<ExpenseCategory> {
            return _.map(this.categories, _.method("getName")) as Array<ExpenseCategory>;
        },
        similarNames(): Array<string> {
            return _.uniq(_.map(this.similarExpenseSchemas, _.property("name"))) as Array<string>;
        }
    },
    data() {
        return {
            allTags: [] as Array<ExpenseTag>,
            categories: [] as Array<ExpenseCategory>,
            categoryName: "",
            cost: null as unknown,
            date: convertDateToString(new Date()),
            errorMessage: null as unknown,
            i18n: i18n.addExpenseForm,
            name: "",
            similarExpenseSchemas: [] as Array<any>,
            tags: [] as ExpenseTag[],
            toastMessage: null as unknown
        };
    },
    methods: {
        onExpenseRegistered() {
            this.categoryName = "";
            this.cost = null;
            this.date = this.date || convertDateToString(new Date());
            this.name = "";
            this.tags = [];
            this.$refs.form.reset();
            this.$refs.form["name"].focus();
        },
        onSubmit(event: any): Promise<any> {
            return this.ensureCategoryRegistration(this.categoryName)
            .then((category: ExpenseCategory) => {
                let expense: Expense = new Expense(undefined, this.name, category, this.date, parseFloat(this.cost), this.tags);

                return this.registerExpense(expense);
            })
            .then(() => {
                this.updateTags();
            })
            .then(() => {
                this.onExpenseRegistered();
                // Explicitly passing the event up the DOM tree. I don't know why it doesn't work out-of-box.
                this.$emit("submit", event);
            });
        },
        onTagsChanged(tags: ExpenseTag[]) {
            this.tags = tags;
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
        },
        updateTags() : Promise<Array<ExpenseTag>> {
            return retrieveTags()
            .then((tags : Array<ExpenseTag>) => {
                this.allTags = tags;
            })
            .catch((error : Error) => {
                this.showError(error);
            })
        }
    },
    mounted() {
        this.updateCategories()
        .then(() => {
            this.updateTags();
        });
    },
    template: `
        <form name="add-expense" class="add-expense-form" ref="form" @submit.prevent="onSubmit">
            <h3>{{ i18n.title }}</h3>
            <auto-complete-field
                v-model.lazy="name"
                :items="similarNames"
                :placeholder="i18n.expenseName"
                autofocus
                class="input-field"
                name="name"
                required
                tabindex="1">
            </auto-complete-field>
            <auto-complete-field
                v-model.lazy="categoryName"
                :items="categoryNames"
                :placeholder="i18n.expenseCategory"
                class="input-field"
                name="category"
                required
                tabindex="2">
            </auto-complete-field>
            <input class="input-field" tabindex="3" autocomplete="off" type="number" :placeholder="i18n.expenseCost" name="cost" step="0.01" min="0.01" required v-model="cost">
            <input class="input-field" tabindex="4" type="date" :placeholder="i18n.expenseDate" name="purchase_date" required v-model="date">
            <tags-field
                :placeholder="i18n.expenseTags"
                :tags="tags"
                :registeredTags="allTags"
                @change="onTagsChanged"
                tabindex="5"
            />
            <button tabindex="6" type="submit" name="submit">{{ i18n.submitButton }}</button>
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
            .then((expenseSchemas: Array<any>) => this.similarExpenseSchemas = expenseSchemas)
            .then(() => {
                let schema = _.find(this.similarExpenseSchemas, { name: this.name });

                if (schema) {
                    this.categoryName = schema.category;
                }
            })
            .then(() => {
                return retrieveCommonExpenseCost(expenseName)
            })
            .then((cost : number) => {
                this.cost = cost;
            })
            .catch((error: Error) => {
                this.showError(error);
            });
        }
    }
};

export default component;
