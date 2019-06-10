import i18n from "utils/i18n";
import AutoCompleteExpenseName from "./InputAutoCompleteExpenseName";
import "./FilterExpensesFormStyles.sass";

export default {
    components: {
        "auto-complete-expense-name": AutoCompleteExpenseName
    },
    data() {
        return {
            errorMessage: null as unknown,
            i18n: i18n.filterExpensesForm,
            filterText: "",
            similarExpenseSchemas: [] as Array<any>,
            toastMessage: null as unknown
        };
    },
    methods: {
        onSubmit(): any {
            this.$emit("submit", this.filterText);
        },
        showError(error: Error) {
            this.errorMessage = error.message;
            setTimeout(() => (this.errorMessage = null), 4000);
        },
        updateFilter(text : string) {
            this.filterText = text;
        }
    },
    template: `
        <form name="find-expenses" class="filter-expenses-form" ref="form" @submit.prevent="onSubmit">
            <auto-complete-expense-name
                v-on:change="updateFilter"
                :on-error="showError"
                :tabindex="6"
            />
            <button tabindex="7" type="submit" name="submit">{{ i18n.submitButton }}</button>
            <transition name="notification">
                <div class="notification" v-if="toastMessage">{{ toastMessage }}</div>
                <div class="notification notification-error" v-if="errorMessage">{{ errorMessage }}</div>
            </transition>
        </form>
    `
};
