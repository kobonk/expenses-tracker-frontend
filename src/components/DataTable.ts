import "./DataTableStyles.sass";
import Cell from "./DataTableCell";
import { DataTableRecord, DataTableRecordCollection, DataTableCell } from "./../types/DataTableTypes";

export default {
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
            return this.data || this.data.getBody().length > 0;
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
            this.onFieldExited();
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
