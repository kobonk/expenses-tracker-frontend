export default {
    props: ["header", "body", "footer"],
    template: `
        <table>
            <thead>
                <tr>
                    <th
                        v-for="headerCell, a in header"
                        v-bind:key="a"
                    >
                        {{headerCell}}
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
                        {{footerCell}}
                    </th>
                </tr>
            </tfoot>
        </table>
    `
}
