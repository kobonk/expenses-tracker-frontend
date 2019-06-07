import i18n from "utils/i18n";
import autoCompleteField from "../auto-complete-field/auto-complete-field";
import { retrieveSimilarExpenseNames } from "utils/restClient";
import "./styles.sass";

const _ = require("lodash");

const component = {
    components: {
        "auto-complete-field": autoCompleteField
    },
    computed: {
        similarNames(): Array<string> {
            return _.uniq(_.map(this.similarExpenseSchemas, _.property("name"))) as Array<string>;
        }
    },
    data() {
        return {
            errorMessage: null as unknown,
            i18n: i18n.filterExpensesForm,
            name: "",
            similarExpenseSchemas: [] as Array<any>,
            toastMessage: null as unknown
        };
    },
    methods: {
        onSubmit(): any {
            this.$emit("submit", this.name);
        },
        showError(error: Error) {
            this.errorMessage = error.message;
            setTimeout(() => (this.errorMessage = null), 4000);
        }
    },
    template: `
        <form name="find-expenses" class="filter-expenses-form" ref="form" @submit.prevent="onSubmit">
            <auto-complete-field
                v-model.lazy="name"
                :items="similarNames"
                :placeholder="i18n.expenseName"
                name="name"
                tabindex="6"
            />
            <button tabindex="7" type="submit" name="submit">{{ i18n.submitButton }}</button>
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
            .catch((error: Error) => {
                this.showError(error);
            });
        }
    }
};

export default component;
