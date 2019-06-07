import Expense from "types/Expense";
import { ExpensesTableData } from "./../../ExpensesTable";
import i18n from "./../../utils/i18n";
import { component as dataTableComponent } from "./../data-table/data-table";
import ViewTitle from './../view-title';

const _ = require("lodash");

const component = {
    components: {
        "data-table": dataTableComponent,
        "view-title": ViewTitle
    },
    computed: {
        expenses() {
            return !this.expensesMap ? {} : this.expensesMap;
        }
    },
    data() {
        return {
            title: _.replace(i18n.filterExpensesForm.resultTitle, "{FILTER_TEXT}", this.filterText)
        };
    },
    methods: {
        createExpensesTableData(expenses: Array<Expense>): ExpensesTableData {
            return new ExpensesTableData(expenses);
        }
    },
    props: ["expensesMap", "filterText", "onClose", "onEdit"],
    template: `
        <div>
            <view-title :on-close="onClose">
                {{ title }}
            </view-title>
            <div v-for="month in Object.keys(expensesMap)" :key="month">
                <h2>{{ month }} <small>({{ expensesMap[month].length }})</small></h2>
                <data-table
                    class="columns-3"
                    :data="createExpensesTableData(expensesMap[month])"
                    :on-cell-edited="onEdit">
                </data-table>
            </div>
        </div>
    `
};

export default component;
