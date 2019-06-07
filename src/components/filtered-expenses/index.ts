import i18n from "./../../utils/i18n";
import ViewTitle from './../view-title';

const _ = require("lodash");

const component = {
    data() {
        return {
            title: _.replace(i18n.filterExpensesForm.resultTitle, "{FILTER_TEXT}", this.filterText)
        };
    },
    props: ["filterText", "onClose"],
    components: {
        "view-title": ViewTitle
    },
    template: `
        <view-title :on-close="onClose">
            {{ title }}
        </view-title>
    `
};

export default component;
