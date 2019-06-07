import i18n from "./../../utils/i18n";
import ViewTitle from './../view-title';

const _ = require("lodash");

const component = {
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
    props: ["expensesMap", "filterText", "onClose"],
    components: {
        "view-title": ViewTitle
    },
    template: `
        <div>
            <view-title :on-close="onClose">
                {{ title }}
            </view-title>
            <ul v-for="month in Object.keys(expensesMap)" :key="month">
                <li><strong>{{ month }}</strong> ({{ expensesMap[month].length }})</li>
            </ul>
        </div>
    `
};

export default component;
