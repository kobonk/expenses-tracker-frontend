import Vue from "vue";
import { hasMethods } from "./../../utils/objectUtils";
import { InputText } from "./../input/InputText";

const _ = require("lodash");

interface DataTableCell {
    getContent(): string;
    getName(): string,
    isClickable(): boolean;
    isEditable(): boolean;
    onClick(): void;
    toString(): string;
};

const isDataTableCellInstance: Function = (value: any): boolean => {
    return hasMethods(value, ["getContent", "getName", "isClickable", "isEditable", "onClick"]);
};

export default Vue.component("table-cell", {
    components: {
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
            if (_.isFunction(this.onChange) && this.data.getContent() !== value) {
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
            {{ data.getContent() }}
        </span>
        <input-text
            ref="inputInEdit"
            v-else
            :value="data.getContent()"
            :on-change="(value) => onFieldUpdated(value)"
            :on-exit="() => editing = false"
        />
    `,
    updated() {
        if (!_.isNil(this.$refs.inputInEdit)) {
            this.$refs.inputInEdit.focus();
        }
    }
});
