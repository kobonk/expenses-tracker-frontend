import Vue from "vue";
import { hasMethods } from "./../utils/objectUtils";
import { InputDate, InputNumber, InputText } from "./input";

const _ = require("lodash");

const isDataTableCellInstance: Function = (value: any): boolean => {
    return hasMethods(value, ["getValue", "getName", "isClickable", "isEditable", "onClick"]);
};

export default Vue.component("table-cell", {
    components: {
        "input-date": InputDate,
        "input-number": InputNumber,
        "input-text": InputText
    },
    computed: {
        editing() {
            return _.isFunction(this.isEdited) && this.isEdited();
        }
    },
    methods: {
        onClicked() {
            if (this.data.isClickable() && this.data.isEditable()) {
                if (_.isFunction(this.onEdit)) this.onEdit();

                return;
            }

            this.data.onClick();
        },
        onFieldUpdated(value: any) {
            if (_.isFunction(this.onChange) && this.data.getValue() !== value) {
                this.onChange({ [this.data.getName()]: value });
            }
        }
    },
    props: {
        data: {
            required: true,
            type: Object,
            validator: (data: any) => isDataTableCellInstance(data)
        },
        isEdited: {
            type: Function
        },
        onChange: {
            type: Function
        },
        onEdit: {
            type: Function
        },
        onExit: {
            type: Function
        }
    },
    template: `
        <span
            :class="data.isClickable() ? 'clickable' : null"
            @click="onClicked()"
            v-if="!editing"
        >
            {{ data.getValue() }}
        </span>

        <input-number
            v-else-if="editing && data.getType() === 'number'"
            :value="data.getValue()"
            :on-change="(value) => onFieldUpdated(value)"
            :on-exit="onExit"
        />

        <input-date
            v-else-if="editing && data.getType() === 'date'"
            :value="data.getValue()"
            :on-change="(value) => onFieldUpdated(value)"
            :on-exit="onExit"
        />

        <input-text
            v-else
            :value="data.getValue()"
            :on-change="(value) => onFieldUpdated(value)"
            :on-exit="onExit"
        />
    `
});
