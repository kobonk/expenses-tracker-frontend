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

export default Vue.component("table-content", {
    components: {
        "input-text": InputText
    },
    data: {
        edited: false
    },
    methods: {
        onClicked() {
            if (this.content.isClickable() && this.content.isEditable()) {
                this.edited = true;
                return;
            }

            this.content.onClick();
        },
        onFieldUpdated(value: any) {
            if (_.isFunction(this.onChange)) {
                this.onChange({ [this.content.getName()]: value });
            }
        }
    },
    props: {
        content: {
            required: true,
            type: Object,
            validator: (content: any) => isDataTableCellInstance(content)
        },
        onChange: {
            type: Function
        }
    },
    template: `
        <span
            class="clickable"
            @click="onClicked()"
            v-if="content.isClickable() && !edited"
        >
            {{ content.getContent() }}
        </span>
        <input-text
            ref="inputInEdit"
            v-else-if="edited"
            :value="content.getContent()"
            :on-change="(value) => onFieldUpdated(row, content, value)"
            :on-exit="() => edited = false"
        />
        <template v-else>{{ content.getContent() }}</template>
    `
});
