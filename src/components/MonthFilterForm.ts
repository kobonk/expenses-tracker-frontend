import { extractMonthName } from "utils/stringUtils";
import i18n from "utils/i18n";
import "./MonthFilterFormStyles.sass";

const moment = require("moment");

const isDecember = (month : string) : boolean => {
    return month.endsWith("-12");
};

const extractYear = (month : string) : string => {
    return month.slice(0, 4);
}

export default {
    computed: {
        monthsList() {
            return [...this.months]
                .reverse()
                .filter((month : string) => moment(month).isBetween(this.startingMonth, this.endingMonth, "month", "[]"))
        },
        monthOptions() {
            return [...this.months]
                .reverse()
                .reduce((months : Array<object>, month : string) => {
                    const monthObject = {
                        name: extractMonthName(month),
                        value: month
                    };

                    if (isDecember(month)) {
                        return [
                            ...months,
                            {
                                disabled: true,
                                name: extractYear(month),
                                value: extractYear(month)
                            },
                            monthObject
                        ]
                    }

                    return [...months, monthObject];
                }, []);
        }
    },
    data() {
        return {
            startingMonth: moment(this.mostRecentMonth).subtract(this.numberOfMonths - 1, "months").format("YYYY-MM"),
            endingMonth: this.mostRecentMonth,
            i18n: i18n
        }
    },
    methods: {
        emitChange() {
            this.$emit("change", this.monthsList);
        }
    },
    props: {
        months: {
            type: Array,
            required: true
        },
        mostRecentMonth: {
            type: String,
            required: true
        },
        numberOfMonths: {
            type: Number,
            required: true
        }
    },
    template: `
        <form class="month-filter-form" @submit.prevent="emitChange">
            <label for="month-filter-starting-month">{{i18n.filterExpensesForm.monthRangeLabelFrom}}:</label>
            <select id="month-filter-starting-month" v-model="startingMonth">
                <option
                    v-for="month, i in monthOptions"
                    v-bind:key="i"
                    :value="month.value"
                    :disabled="month.disabled"
                >{{month.name}}</option>
            </select>
            <label for="month-filter-ending-month">{{i18n.filterExpensesForm.monthRangeLabelTo}}:</label>
            <select id="month-filter-ending-month" v-model="endingMonth">
                <option
                    v-for="month, i in monthOptions"
                    v-bind:key="i"
                    :value="month.value"
                    :disabled="month.disabled"
                >{{month.name}}</option>
            </select>
            <button type="submit">{{i18n.filterExpensesForm.filterButtonLabel}}</button>
        </form>
    `,
    watch: {
        endingMonth(newEndingMonth : string) {
            if (moment(newEndingMonth).diff(moment(this.startingMonth), "months") < 0) {
                this.startingMonth = newEndingMonth;
            }
        },
        startingMonth(newStartingMonth : string) {
            if (moment(newStartingMonth).diff(moment(this.endingMonth), "months") > 0) {
                this.endingMonth = newStartingMonth;
            }
        }
    }
}
