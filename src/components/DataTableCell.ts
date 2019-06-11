import Vue from "vue";
import { hasMethods } from "./../utils/objectUtils";
import DataTableCellClickable from "./DataTableCellClickable";
import DataTableCellEditable from "./DataTableCellEditable";
import DataTableCellPlain from "./DataTableCellPlain";

const _ = require("lodash");

const isDataTableCellInstance: Function = (value: any): boolean => {
    return hasMethods(value, ["getValue", "getName", "isClickable", "isEditable", "onClick"]);
};

export default Vue.component("table-cell", {
    components: {
        "table-cell-clickable": DataTableCellClickable,
        "table-cell-editable": DataTableCellEditable,
        "table-cell-plain": DataTableCellPlain
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
        <table-cell-editable v-if="data.isEditable()"
            :value="data.getValue()"
            :format="data.getType()"
            :on-change="onFieldUpdated"
        >
        </table-cell-editable>
        <table-cell-clickable v-else-if="data.isClickable()"
            :value="data.getValue()"
            :on-click="onClicked"
        >
        </table-cell-clickable>
        <table-cell-plain v-else
            :value="data.getValue()"
        >
        </table-cell-plain>
    `
});
