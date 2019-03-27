import "./styles.sass";
import { hasMethods } from "./../../utils/objectUtils";
import { InputText } from "./../input/InputText";

const _ = require("lodash");

interface DataTableCell {
    getContent(): string | Number;
    getName(): string,
    isClickable(): boolean;
    isEditable(): boolean;
    onClick(): void;
    toString(): string;
};

interface DataTableRow {
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

    return cell.getContent() as number;
}

const component = {
    components: {
        "input-text": InputText
    },
    computed: {
        bodyRows(): Array<Array<string>> {
            let sortedRows: Array<Array<DataTableCell>> = _.sortBy(
                this.normalizedBodyRows,
                (row: Array<DataTableCell>) => getSortableContent(row[this.sortColumnIndex])
            );

            return this.sortDirection === "asc" ? sortedRows : _.reverse(sortedRows);
        },
        footerCells(): Array<string | Number> {
            return _.isEmpty(this.footer) ? [] : this.addMissingCells(this.footer);
        },
        headerCells(): Array<string | Number> {
            return _.isEmpty(this.header) ? [] : this.addMissingCells(this.header);
        },
        normalizedBodyRows(): Array<Array<DataTableCell>> {
            // You really need to rewrite this method!!!




            return _.map(
                _.chain(this.rows)
                .map((row: Array<string | number | DataTableCell> | DataTableRow) => isDataTableRowInstance(row) ? (row as DataTableRow).getCells() : row)
                .map(this.addMissingCells)
                .value(),
                (row: Array<string | number | DataTableCell>) => {
                    return _.map(row, (cell: string | number | DataTableCell) => {
                        if (isDataTableCellInstance(cell)) {
                            return cell;
                        }

                        return new TableCell(cell as string);
                    })
                }
            )
        },
        normalizeBodyCell: (cell: string | number | DataTableCell): DataTableCell => {
            if (isDataTableCellInstance(cell)) return cell as DataTableCell;

            return new TableCell(cell.toString());
        },
        normalizeBodyRow(row: Array<string | number | DataTableCell> | DataTableRow): DataTableRow {
            if (isDataTableRowInstance(row)) return row as DataTableRow;

            return new TableRow("", _.map(row, this.normalizeBodyCell));
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
        addMissingCells(row: Array<string | Number | DataTableCell>): Array<string | DataTableCell> {
            console.log(this.numberOfColumns, row.length);
            let missingCells = _.fill(new Array(Math.abs(this.numberOfColumns - row.length)), "");

            return _.concat(row, missingCells);
        },
        onCellClicked(cell: DataTableCell) {
            console.log(cell.isEditable(), cell.isClickable(), this.cellInEdit !== cell);
            if (cell.isClickable() && cell.isEditable() && this.cellInEdit !== cell) {
                this.cellInEdit = cell;
                return;
            }
            cell.onClick();
        },
        onFieldUpdated(cell: DataTableCell, value: string) {
            this.onCellEdited(cell.getName(), value);
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
            <thead v-if="headerCells.length > 0">
                <tr>
                    <th
                        :class="sortColumnIndex === i ? 'sorted-' + sortDirection : null"
                        @click="sortColumn(i)"
                        v-bind:key="i"
                        v-for="(headerCell, i) in headerCells">{{ headerCell }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, i) in bodyRows" v-bind:key="i">
                    <td
                        :class="cell === cellInEdit ? 'in-edit' : null"
                        v-for="(cell, i) in row"
                        v-bind:key="i">
                        <span
                            class="clickable"
                            @click="onCellClicked(cell)"
                            v-if="cell.isClickable() && cell !== cellInEdit"
                        >
                            {{ cell.getContent() }}
                        </span>
                        <input-text
                            v-else-if="cell === cellInEdit"
                            :value="cell.getContent()"
                            :on-change="(value) => onFieldUpdated(cell, value)"
                            :on-exit="() => cellInEdit = null"
                        />
                        <template v-else>{{ cell.getContent() }}</template>
                    </td>
                </tr>
            </tbody>
            <tfoot v-if="footerCells.length > 0">
                <tr>
                    <th v-for="(footerCell, i) in footerCells" v-bind:key="i">{{ footerCell }}</th>
                </tr>
            </tfoot>
        </table>
    `
};

export { component, DataTableCell, DataTableRow, TableData };
