import "./styles.sass";
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

interface DataTableRow {
    getBuilder(): any,
    getCells(): Array<DataTableCell>;
    getId(): string
}

class TableRow implements DataTableRow {
    private cells: Array<DataTableCell>;
    private id: string;

    constructor(id: string, cells: Array<DataTableCell>) {
        this.cells = cells;
        this.id = id;
    }

    public getCells(): Array<DataTableCell> {
        return this.cells;
    }

    public getId(): string {
        return this.id;
    }

    public getBuilder() {
        let id: string = this.getId();
        let cells: Array<DataTableCell> = this.getCells();

        return {
            setId: function(newId: string) {
                id = newId;
                return this;
            },
            setCells: function(newCells: Array<DataTableCell>) {
                cells = newCells;
                return this;
            },
            build: function() {
                return new TableRow(id, cells);
            }
        }
    }
}

class TableCell implements DataTableCell {
    private content: string;

    constructor(content: string) {
        this.content = content;
    }

    getContent(): string {
        return this.content;
    }

    getName(): string {
        return "";
    }

    isClickable(): boolean {
        return false;
    }

    isEditable(): boolean {
        return false;
    }

    onClick() {
        return
    }
};

type TableData = {
    footer: Array<string | Number>,
    header: Array<string | Number>,
    rows: Array<Array<string | Number | DataTableCell> | DataTableRow>
};

const isDataTableCellInstance: Function = (value: any): boolean => {
    return hasMethods(value, ["getContent", "onClick"]);
};

const isDataTableRowInstance: Function = (value: any): boolean => {
    return hasMethods(value, ["getId", "getCells"]);
};

const getSortableContent: Function = (cell: DataTableCell): string | number => {
    if (/^[\d\.,\s]*$/.test(cell.getContent() as string)) {
        return parseFloat((cell.getContent() as string).replace(/\s/g, ""));
    }

    return cell.getContent();
}

const component = {
    components: {
        "input-text": InputText
    },
    computed: {
        bodyRows(): Array<Array<string>> {
            let sortedRows: Array<DataTableRow> = _.sortBy(
                this.normalizedBodyRows,
                (row: DataTableRow) => getSortableContent(row.getCells()[this.sortColumnIndex])
            );

            return this.sortDirection === "asc" ? sortedRows : _.reverse(sortedRows);
        },
        footerRow(): DataTableRow {
            return _.isEmpty(this.footer) ? [] : this.addMissingCells(this.footer);
        },
        headerRow(): DataTableRow {
            return _.isEmpty(this.header) ? [] : this.addMissingCells(this.header);
        },
        normalizedBodyRows(): Array<Array<DataTableCell>> {
            return _.chain(this.rows)
            .map(this.normalizeBodyRow)
            .map(this.addMissingCells)
            .value();
        },
        numberOfColumns(): Number {
            return _.reduce(
                this.rows,
                (result: Number, row: Array<string | Number | DataTableCell> | DataTableRow) => {
                    const cellCount: number = isDataTableRowInstance(row) ? (row as DataTableRow).getCells().length : (row as Array<any>).length;

                    return cellCount > result ? cellCount : result;
                },
                0
            )
        },
        tableVisible(): boolean {
            return this.bodyRows.length > 0;
        }
    },
    data() {
        return {
            cellInEdit: null as any,
            sortColumnIndex: _.isNil(this.sortBy) ? 0 : this.sortBy,
            sortDirection: _.isNil(this.sortDir) ? "asc" : this.sortDir
        }
    },
    methods: {
        addMissingCells(row: Array<string | number | DataTableCell> | DataTableRow): DataTableRow {
            const validRow = isDataTableRowInstance(row) ? row : this.normalizeBodyRow(row);
            let missingCells = _.fill(new Array(Math.abs(this.numberOfColumns - validRow.getCells().length)), new TableCell(""));

            return validRow.getBuilder()
            .setCells(_.concat(validRow.getCells(), missingCells))
            .build();
        },
        normalizeBodyCell: (cell: string | number | DataTableCell): DataTableCell => {
            if (isDataTableCellInstance(cell)) return cell as DataTableCell;

            return new TableCell(_.isNumber(cell) ? String(cell) : cell as string);
        },
        normalizeBodyRow(row: Array<string | number | DataTableCell> | DataTableRow, index: number): DataTableRow {
            if (isDataTableRowInstance(row)) return row as DataTableRow;

            return new TableRow(!_.isNil(index) ? String(index + 1) : "", _.map(row, this.normalizeBodyCell));
        },
        onCellClicked(cell: DataTableCell) {
            if (cell.isClickable() && cell.isEditable() && this.cellInEdit !== cell) {
                this.cellInEdit = cell;
                return;
            }

            cell.onClick();
        },
        onFieldUpdated(row: DataTableRow, cell: DataTableCell, value: string) {
            this.onCellEdited(row.getId(), { [cell.getName()]: value });
        },
        sortColumn(columnIndex: number) {
            if (this.sortColumnIndex === columnIndex) {
                this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
            }

            this.sortColumnIndex = columnIndex;
        }
    },
    props: ["rows", "footer", "header", "onCellEdited", "sortDir", "sortBy"],
    template: `
        <table v-if="tableVisible" class="data-table">
            <thead v-if="headerRow.getCells().length > 0">
                <tr>
                    <th
                        :class="sortColumnIndex === i ? 'sorted-' + sortDirection : null"
                        @click="sortColumn(i)"
                        v-bind:key="i"
                        v-for="(headerCell, i) in headerRow.getCells()">{{ headerCell.getContent() }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, i) in bodyRows" v-bind:key="i">
                    <td
                        :class="cell === cellInEdit ? 'in-edit' : null"
                        v-for="(cell, i) in row.getCells()"
                        v-bind:key="i">
                        <span
                            class="clickable"
                            @click="onCellClicked(cell)"
                            v-if="cell.isClickable() && cell !== cellInEdit"
                        >
                            {{ cell.getContent() }}
                        </span>
                        <input-text
                            ref="inputInEdit"
                            v-else-if="cell === cellInEdit"
                            :value="cell.getContent()"
                            :on-change="(value) => onFieldUpdated(row, cell, value)"
                            :on-exit="() => cellInEdit = null"
                        />
                        <template v-else>{{ cell.getContent() }}</template>
                    </td>
                </tr>
            </tbody>
            <tfoot v-if="footerRow.getCells().length > 0">
                <tr>
                    <th v-for="(footerCell, i) in footerRow.getCells()" v-bind:key="i">{{ footerCell.getContent() }}</th>
                </tr>
            </tfoot>
        </table>
    `,
    updated() {
        if (!_.isEmpty(this.$refs.inputInEdit)) {
            _.first(this.$refs.inputInEdit).focus();
        }
    }
};

export { component, DataTableCell, DataTableRow, TableData };
