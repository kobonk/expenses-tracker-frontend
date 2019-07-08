const moment = require("moment");

export default {
    computed: {
        selectedMonths() {
            const borderMonth = moment(this.mostRecentMonth);

            return [...this.months]
                .reverse()
                .filter((month : string) => moment(month).isSameOrBefore(borderMonth))
                .slice(0, this.numberOfMonths);
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
        <form>
            Show consecutive
            <input type="number" name="month_count" value="7" />
            months ending on
            <select name="last_month">
                <option
                    v-for="month, i in [...months].reverse()"
                    v-bind:key="i"
                    :value="month"
                >{{month}}</option>
            </select>
            {{selectedMonths}}
        </form>
    `
}
