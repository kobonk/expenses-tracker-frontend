import "./styles.sass";
import Cell from "./data-table-cell";
import { DataTableRecord, DataTableRecordCollection } from "./data-table-types";

const _ = require("lodash");

interface DataTableCell {
    getContent(): string;
    getName(): string,
    isClickable(): boolean;
    isEditable(): boolean;
    onClick(): void;
    toString(): string;
};

interface DataTableRow {
    getBuilder(): any,
    getCells(): Array<DataTableCell>;
    getId(): string
}

type TableData = {
    footer: Array<string | Number>,
    header: Array<string | Number>,
    rows: Array<Array<string | Number | DataTableCell> | DataTableRow>
};

const component = {
    components: {
        "table-cell": Cell
    },
    computed: {
        sortingDirection(): string {
            return this.data.getSortingDirection();
        },
        sortingKey(): string {
            return this.data.getSortingKey();
        },
        tableVisible(): boolean {
            return _.isNil(this.data) ? false : this.data.getBody().length > 0;
        }
    },
    data() {
        return {
            editedCell: null as any
        }
    },
    methods: {
        onFieldUpdated(row: DataTableRecordCollection, value: Object) {
            this.onCellEdited(row.getKey(), value);
        },
        onFieldExited() {
            this.editedCell = null;
        },
        onCellClicked(cell: DataTableCell) {
            this.editedCell = cell;
        },
        onHeaderClicked(cell: DataTableRecord) {
            cell.onClick();
        }
    },
    props: ["data", "onCellEdited"],
    template: `
        <table v-if="tableVisible" class="data-table">
            <thead v-if="data.getHeader().length > 0">
                <tr v-for="(row) in data.getHeader()" v-bind:key="row.getKey()">
                    <th
                        v-for="(cell) in row.getRecords()"
                        v-bind:key="cell.getName()"
                        :class="sortingKey === cell.getName() ? 'sorted-' + sortingDirection : null"
                    >
                        <table-cell
                            :data="cell"
                            :on-change="() => onHeaderClicked(cell)"
                        />
                    </th>
                </tr>
            </thead>
            <tbody v-if="data.getBody().length > 0">
                <tr v-for="(row) in data.getBody()" v-bind:key="row.getKey()">
                    <td v-for="(cell) in row.getRecords()" v-bind:key="cell.getName()">
                        <table-cell
                            :data="cell"
                            :is-edited="() => editedCell === cell"
                            :on-change="(value) => onFieldUpdated(row, value)"
                            :on-edit="() => onCellClicked(cell)"
                            :on-exit="onFieldExited"
                        />
                    </td>
                </tr>
            </tbody>
            <tfoot v-if="data.getFooter().length > 0">
                <tr v-for="(row) in data.getFooter()" v-bind:key="row.getKey()">
                    <th v-for="(cell) in row.getRecords()" v-bind:key="cell.getName()">
                        <table-cell :data="cell" />
                    </th>
                </tr>
            </tfoot>
        </table>
    `
};

export { component, DataTableCell, DataTableRow, TableData };
