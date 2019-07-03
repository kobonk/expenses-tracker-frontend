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
                    v-for="bodyRow, i in body"
                    v-bind:key="i"
                >
                    <td
                        v-for="bodyCell, j in bodyRow"
                        v-bind:key="j"
                    >
                        <table-cell :data="bodyCell" />
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th
                        v-for="footerCell, b in footer"
                        v-bind:key="b"
                    >
                        <table-cell :data="footerCell" />
                    </th>
                </tr>
            </tfoot>
        </table>
    `
}
