import Cell from "./DataTableCell";

export default {
    components: {
        "table-cell": Cell
    },
    props: {
        header: {
            type: Array,
            required: true
        },
        body: {
            type: Array,
            required: true
        },
        checkedRows: {
            type: Array
        },
        footer: {
            type: Array,
            required: true
        },
        sortedColumn: Number,
        sortingDirection: String
    },
    template: `
        <table>
            <thead>
                <tr>
                    <th
                        v-for="headerCell, a in header"
                        v-bind:key="a"
                        :class="a === sortedColumn ? 'sorted-' + sortingDirection : null"
                    >
                        <table-cell :data="headerCell" />
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="bodyRow in body"
                    v-bind:key="bodyRow.getId()"
                    :class="checkedRows.includes(bodyRow.getId()) ? 'selected' : null"
                >
                    <td
                        v-for="bodyCell, j in bodyRow.getCells()"
                        v-bind:key="j"
                    >
                        <table-cell
                            :checked="checkedRows"
                            :data="bodyCell"
                        />
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr
                    v-for="footerRow in footer"
                    v-bind:key="footerRow.getId()"
                >
                    <th
                        v-for="footerCell, b in footerRow.getCells()"
                        v-bind:key="b"
                    >
                        <table-cell :data="footerCell" />
                    </th>
                </tr>
            </tfoot>
        </table>
    `
}
