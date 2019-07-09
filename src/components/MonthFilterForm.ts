const moment = require("moment");

export default {
    computed: {
        monthsList() {
            return [...this.months]
                .reverse()
                .filter((month : string) => moment(month).isBetween(this.startingMonth, this.endingMonth, "month", "[]"))
        }
    },
    data() {
        return {
            startingMonth: moment(this.mostRecentMonth).subtract(this.numberOfMonths - 1, "months").format("YYYY-MM"),
            endingMonth: this.mostRecentMonth
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
        <form @submit.prevent="emitChange">
            <select v-model="startingMonth">
                <option
                    v-for="month, i in [...months].reverse()"
                    v-bind:key="i"
                    :value="month"
                >{{month}}</option>
            </select>
            <select v-model="endingMonth">
                <option
                    v-for="month, i in [...months].reverse()"
                    v-bind:key="i"
                    :value="month"
                >{{month}}</option>
            </select>
            <br>{{monthsList}}<br>
            <button type="submit">EXECUTE</button>
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
