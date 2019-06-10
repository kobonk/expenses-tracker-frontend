import Expense from "types/Expense";
import { ExpensesTableData } from "./../../ExpensesTable";
import i18n from "./../../utils/i18n";
import { extractMonthName, formatNumber } from "./../../utils/stringUtils";
import { component as dataTableComponent } from "./../data-table/data-table";
import AverageMonthly from './../average-monthly';
import ViewTitle from './../view-title';

const _ = require("lodash");

const component = {
    components: {
        "data-table": dataTableComponent,
        "average": AverageMonthly,
        "view-title": ViewTitle
    },
    computed: {
        total() {
            if (!this.expensesMap) {
                return 0;
            }

            return Object.keys(this.expensesMap)
                .reduce(
                    (total : number, month : string) => {
                        return this.expensesMap[month]
                            .reduce((monthTotal : number, expense : Expense) => {
                                return monthTotal += expense.getCost();
                            },
                            total
                        );
                    },
                    0
                );
        },
        average() {
            if (!this.expensesMap || !this.total) {
                return 0;
            }

            return this.total / Object.keys(this.expensesMap).length;
        }
    },
    data() {
        return {
            i18n: i18n,
            title: _.replace(i18n.filterExpensesForm.resultTitle, "{FILTER_TEXT}", this.filterText)
        };
    },
    methods: {
        createExpensesTableData(expenses: Array<Expense>): ExpensesTableData {
            return new ExpensesTableData(expenses);
        },
        displayMonth(month: string): string {
            return extractMonthName(month);
        },
        formatNumber: formatNumber
    },
    props: ["expensesMap", "filterText", "onClose", "onEdit"],
    template: `
        <div>
            <view-title :on-close="onClose">
                {{ title }}
            </view-title>
            <average :total="total" :number-of-months="Object.keys(expensesMap).length" />
            <div v-for="month in Object.keys(expensesMap).sort().reverse()" :key="month">
                <h2>{{ displayMonth(month) }} <small>({{ expensesMap[month].length }})</small></h2>
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
