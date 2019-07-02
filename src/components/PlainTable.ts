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
        body: Array,
        bodyCells: Array,
        footer: {
            type: Array,
            required: true
        }
    },
    template: `
        <table>
            <thead>
                <tr>
                    <th
                        v-for="headerCell, a in header"
                        v-bind:key="a"
                    >
                        <span>{{headerCell}}</span>
                    </th>
                </tr>
            </thead>
            <tbody v-if="bodyCells">
                <tr
                    v-for="bodyRow, i in bodyCells"
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
            <tbody v-else>
                <tr
                    v-for="bodyRow, i in body"
                    v-bind:key="i"
                >
                    <td
                        v-for="bodyCell, j in bodyRow"
                        v-bind:key="j"
                    >
                        <span>{{bodyCell}}</span>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th
                        v-for="footerCell, b in footer"
                        v-bind:key="b"
                    >
                        <span>{{footerCell}}</span>
                    </th>
                </tr>
            </tfoot>
        </table>
    `
}
