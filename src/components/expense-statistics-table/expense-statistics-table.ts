import Vue from "vue";
import MonthStatistics from 'types/MonthStatistics';
import i18n from 'utils/i18n';
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
        sortedStatistics():Array<MonthStatistics> {
            if (this.sortKey === "category") {
                return this.sortByCategory(this.statistics, this.sortDirection);
            }

            let monthIndex:number = parseInt(_.last(this.sortKey.split(":")));

            return this.sortByMonth(this.statistics, monthIndex, this.sortDirection);
        },
        totalLabel():string {
            return i18n.statisticsTable.totalLabel;
        },
        totals():Array<string> {
            return _.map(this.calculateTotals(this.statistics), _.method("toFixed", 2));
        }
    },
    data() {
        return {
            sortKey: "category",
            sortDirection: "asc"
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
        },
        sortByCategory(statistics:Array<MonthStatistics>, direction:string):Array<MonthStatistics> {
            let ascending = _.sortBy(statistics, _.method("getCategoryName"));

            return _.toLower(direction) !== "asc" ? _.reverse(ascending) : ascending;
        },
        sortByMonth(statistics:Array<MonthStatistics>, monthIndex:number, direction:string):Array<MonthStatistics> {
            let ascending = _.sortBy(statistics, (stat:MonthStatistics) => {
                let monthTotal:MonthTotal = _.get(stat.getMonths(), monthIndex, createFakeMonthTotal(0));

                return monthTotal.getTotal()
            });

            return _.toLower(direction) !== "asc" ? _.reverse(ascending) : ascending;
        },
        sortColumn(key:string) {
            if (key === this.sortKey) {
                this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
            }

            this.sortKey = key;
        }
    },
    props: ["statistics", "numberOfMonths"],
    template: `
        <table v-if="sortedStatistics.length > 0" class="expense-statistics-table">
            <thead>
                <tr>
                    <th
                        :class="sortKey === 'category' ? 'sorted-' + sortDirection : null"
                        @click="sortColumn('category')">{{ categoryLabel }}</th>
                    <th
                        :class="sortKey === 'month:' + i ? 'sorted-' + sortDirection : null"
                        @click="sortColumn('month:' + i)"
                        v-for="(monthName, i) in getMonthNames()">{{ monthName }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in sortedStatistics">
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
