import "./styles.sass";

const _ = require("lodash");

interface DataTableCell {
    getContent(): string | Number;
    onClick(): void
};

class TableCell implements DataTableCell {
    private content: string;

    constructor(content: string) {
        this.content = content;
    }

    getContent(): string {
        return this.content;
    }

    onClick() {
        return
    }
};

type TableData = {
    footer: Array<string | Number>,
    header: Array<string | Number>,
    rows: Array<Array<string | Number | DataTableCell>>
};

const isDataTableCellInstance: Function = (value: any): boolean => {
    let methodNames = ["getContent", "onClick"];

    return _.every(_.map(methodNames, (methodName: string) => _.isFunction(_.get(value, methodName))))
};

const getSortableContent: Function = (cell: DataTableCell): string | number => {
    if (/^[\d\.,\s]*$/.test(cell.getContent() as string)) {
        return parseFloat((cell.getContent() as string).replace(/\s/g, ""));
    }

    return cell.getContent() as number;
}

const component = {
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
            return _.map(
                _.map(this.rows, this.addMissingCells),
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
        numberOfColumns(): Number {
            return _.reduce(
                this.rows,
                (result: Number, row: Array<string | Number>) => {
                    return row.length > result ? row.length : result;
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
            sortColumnIndex: _.isNil(this.sortBy) ? 0 : this.sortBy,
            sortDirection: _.isNil(this.sortDir) ? "asc" : this.sortDir
        }
    },
    methods: {
        addMissingCells(row: Array<string | Number | DataTableCell>): Array<string | DataTableCell> {
            let missingCells = _.fill(new Array(Math.abs(this.numberOfColumns - row.length)), "");

            return _.concat(row, missingCells);
        },
        sortColumn(columnIndex: number) {
            if (this.sortColumnIndex === columnIndex) {
                this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
            }

            this.sortColumnIndex = columnIndex;
        }
    },
    props: ["rows", "footer", "header", "sortDir", "sortBy"],
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
                    <td v-for="(cell, i) in row" v-bind:key="i" @click="cell.onClick()">{{ cell.getContent() }}</td>
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

export { component, DataTableCell, TableData };
