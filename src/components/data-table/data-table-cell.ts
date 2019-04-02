import Vue from "vue";
import { hasMethods } from "./../../utils/objectUtils";
import { InputNumber, InputText } from "./../input";

const _ = require("lodash");

const isDataTableCellInstance: Function = (value: any): boolean => {
    return hasMethods(value, ["getValue", "getName", "isClickable", "isEditable", "onClick"]);
};

export default Vue.component("table-cell", {
    components: {
        "input-number": InputNumber,
        "input-text": InputText
    },
    data(): Object {
        return { editing: false };
    },
    methods: {
        onClicked() {
            if (this.data.isClickable() && this.data.isEditable()) {
                this.editing = true;

                return;
            }

            this.data.onClick();
        },
        onFieldUpdated(value: any) {
            if (_.isFunction(this.onChange) && this.data.getValue() !== value) {
                this.onChange({ [this.data.getName()]: value });
            }

            this.editing = false;
        }
    },
    props: {
        data: {
            required: true,
            type: Object,
            validator: (data: any) => isDataTableCellInstance(data)
        },
        onChange: {
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
            :on-exit="() => editing = false"
        />

        <input-text
            v-else
            :value="data.getValue()"
            :on-change="(value) => onFieldUpdated(value)"
            :on-exit="() => editing = false"
        />
    `
});
