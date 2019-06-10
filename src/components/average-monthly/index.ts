import i18n from "./../../utils/i18n";
import { formatNumber } from "./../../utils/stringUtils";

export default {
    data() {
        return {
            formatNumber: formatNumber,
            i18n: i18n
        };
    },
    computed: {
        average() {
            if (!this.numberOfMonths || !this.total) {
                return 0;
            }

            return this.total / this.numberOfMonths;
        }
    },
    props: ["total", "numberOfMonths"],
    template: `
        <div>
            {{ i18n.averageLabel }}:
            <strong>
                {{ formatNumber(total) }}
            </strong> / {{ i18n(i18n.monthCount, numberOfMonths) }} =
            <strong>
                {{ formatNumber(average) }}
            </strong>
        </div>
    `
}
