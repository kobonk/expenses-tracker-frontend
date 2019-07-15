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
            return this.currentlyEditedCell === this.data;
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
        checked: {
            type: Array
        },
        currentlyEditedCell: {
            required: false,
            type: Object,
            validator: (cell: any) => isDataTableCellInstance(cell)
        },
        data: {
            required: true,
            type: Object,
            validator: (cell: any) => isDataTableCellInstance(cell)
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
            :currently-edited="editing"
            :value="data.getValue()"
            :format="data.getType()"
            :on-enter="onClicked"
            :on-change="onFieldUpdated"
        >
        </table-cell-editable>
        <table-cell-clickable v-else-if="data.isClickable()"
            :checkedOptions="checked"
            :format="data.getType()"
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
