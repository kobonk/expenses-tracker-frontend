import i18n from "utils/i18n";
import AutoCompleteField from "./auto-complete-field/auto-complete-field";
import { retrieveSimilarExpenseNames } from "utils/restClient";

export default {
    components: {
        "auto-complete-field": AutoCompleteField
    },
    computed: {
        similarNames(): Array<string> {
            return this.similarExpenseSchemas
                .reduce(
                    (result : Array<string>, schema : any) => {
                        if (result.find(({ name } : any) => schema.name === name)) {
                            return result;
                        }

                        return [...result, schema.name];
                    },
                    []
                );
        }
    },
    data() {
        return {
            i18n: i18n.findExpensesForm,
            name: "",
            similarExpenseSchemas: [] as Array<any>
        };
    },
    props: ["onError", "tabindex"],
    template: `
        <auto-complete-field
            v-model.lazy="name"
            :items="similarNames"
            :placeholder="i18n.expenseName"
            name="name"
            tabindex="tabindex"
        />
    `,
    watch: {
        name(expenseName: string) {
            this.$emit("change", expenseName);

            if (!expenseName) {
                return;
            }

            retrieveSimilarExpenseNames(expenseName)
            .then((expenseSchemas: Array<any>) => this.similarExpenseSchemas = expenseSchemas)
            .catch((error: Error) => {
                this.onError(error);
            });
        }
    }
};
