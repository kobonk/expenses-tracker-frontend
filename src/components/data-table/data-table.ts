import "./styles.sass";

const _ = require("lodash");

export default {
    computed: {
        bodyRows(): Array<Array<String | Number>> {
            let completeRows: Array<Array<String | Number>> = _.map(this.rows, this.addMissingCells);

            let sortedRows: Array<Array<String | Number>> = _.sortBy(completeRows, (row: Array<String | Number>) => {
                return row[this.sortColumnIndex];
            });

            return this.sortDirection === "asc" ? sortedRows : _.reverse(sortedRows);
        },
        footerCells(): Array<String | Number> {
            return _.isEmpty(this.footer) ? [] : this.addMissingCells(this.footer);
        },
        headerCells(): Array<String | Number> {
            return _.isEmpty(this.header) ? [] : this.addMissingCells(this.header);
        },
        numberOfColumns(): Number {
            return _.reduce(
                this.rows,
                (result: Number, row: Array<String | Number>) => {
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
            sortColumnIndex: 0,
            sortDirection: "asc"
        }
    },
    methods: {
        addMissingCells(row: Array<String | Number>): Array<String | Number> {
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
    props: ["rows", "footer", "header"],
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
                    <td v-for="(cell, i) in row" v-bind:key="i">{{ cell }}</td>
                </tr>
            </tbody>
            <tfoot v-if="footerCells.length > 0">
                <tr>
                    <th v-for="(footerCell, i) in footerCells" v-bind:key="i">{{ footerCell }}</th>
                </tr>
            </tfoot>
        </table>
    `
}
