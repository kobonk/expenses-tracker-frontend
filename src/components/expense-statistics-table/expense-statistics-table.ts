import Vue from "vue";
import MonthStatistics from 'types/MonthStatistics';
import i18n from 'utils/i18n';
import { retrieveMonthStatistics } from "utils/restClient";
import MonthTotal from "types/MonthTotal";
import "./styles.sass"

const _ = require("lodash");

const createFakeMonthTotal:Function = (total:number):MonthTotal => {
    return new MonthTotal("9999-12", total);
}

const component = Vue.extend({
    computed: {
        categoryLabel():string {
            return i18n.statisticsTable.categoryLabel;
        },
        totalLabel():string {
            return i18n.statisticsTable.totalLabel;
        },
        totals():Array<string> {
            return _.map(this.calculateTotals(this.statistics), _.method("toFixed", 2));
        }
    },
    methods: {
        calculateTotals(rows:Array<MonthStatistics>):Array<number> {
            if (_.isEmpty(rows)) {
                return [];
            }

            let initialTable = _.fill(new Array(this.numberOfMonths), 0);

            return _.reduce(
                rows,
                (result:Array<number>, row:MonthStatistics) => {
                    let monthTotals:Array<number> = _.map(row.getMonths(), (month:MonthTotal) => month.getTotal());

                    return _.map(result, (total:number, index:number) => total + _.get(monthTotals, index, 0));
                },
                initialTable
            );
        },
        getFormattedTotalForMonth(row:MonthStatistics, index:number):string {
            let month:MonthTotal = _.get(row.getMonths(), index, createFakeMonthTotal(0));

            return month.getFormattedTotal();
        },
        getMonthNames():Array<string> {
            let rowWithGreatestMonthNumber = _.last(_.sortBy(this.statistics, (row:MonthStatistics) => row.getMonths().length))
            let availableMonthNames = _.map(rowWithGreatestMonthNumber.getMonths(), _.method("getMonthName"));
            let lackingMonths = _.fill(new Array(this.numberOfMonths - availableMonthNames.length), "n/a");

            return _.concat(availableMonthNames, lackingMonths)
        }
    },
    props: ["statistics", "numberOfMonths"],
    template: `
        <table v-if="statistics.length > 0" class="expense-statistics-table">
            <thead>
                <tr>
                    <th>{{ categoryLabel }}</th>
                    <th v-for="monthName in getMonthNames()">{{ monthName }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in statistics">
                    <td>{{ row.getCategoryName() }}</td>
                    <td v-for="(n, i) in numberOfMonths">{{ getFormattedTotalForMonth(row, i) }}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th>{{ totalLabel }}</th>
                    <th v-for="total in totals">{{ total }}</th>
                </tr>
            </tfoot>
        </table>
    `
});

export default component;
