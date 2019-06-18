import i18n from 'utils/i18n';
import "./DataTableForCategoriesStyles.sass";
import { extractMonthName, formatNumber } from "utils/stringUtils";
import Cell from "./DataTableCell";
import DataTable from "./DataTable";
import PlainTable from "./PlainTable";
import MonthStatistics from "./../types/MonthStatistics";
import MonthTotal from "./../types/MonthTotal";
import { DataTableRecord, DataTableRecordCollection, DataTableCell } from "./../types/DataTableTypes";
import { StatisticsTableData } from "./../StatisticsTable";

const getTbodyParent = (element : HTMLElement) : HTMLElement => {
    if (!element || !element.parentElement) {
        return null;
    }

    let parent = element.parentElement;

    while (parent && !(/tbody/i).test(parent.tagName)) {
        parent = parent.parentElement;
    }

    return parent;
};

export default {
    components: {
        "data-table": DataTable,
        "plain-table": PlainTable,
        "table-cell": Cell
    },
    computed: {
        monthColumns() : Array<any> {
            return this.months
                .map((month : string) => {
                    return {
                        id: month,
                        name: extractMonthName(month)
                    };
                });
        },
        nonScrollables() : NodeList {
            return this.$el.querySelectorAll('.scroll-disabled tbody');
        },
        scrollController() : HTMLElement {
            return this.$refs["scrollController"].$el.querySelector('table:last-child tbody');
        },
        tableVisible() : boolean {
            return this.data || this.data.getBody().length > 0;
        },
        tables() : Array<any> {
            const monthRows = this.rows.map((row : MonthStatistics) => {
                return this.months.map((month : string) => {
                    const total : MonthTotal = row.getMonths()
                        .find((rowMonth : MonthTotal) => rowMonth.getMonth() === month);

                    if (!total) {
                        return formatNumber(0, 2);
                    }

                    return total.getFormattedTotal();
                });
            });

            const monthTotals = this.months.map((month : string, i : number) => {
                return monthRows.reduce(
                    (sum : number, row : Array<string>) => {
                        return sum += parseFloat(row[i].replace(/\s/g, ""));
                    },
                    0
                );
            })
            .map((total : number) => formatNumber(total, 2));

            const categoryTotals = this.rows.map((row : MonthStatistics) => {
                const total = row.getMonths().reduce((sum : number, total : MonthTotal) => sum + total.getTotal(), 0);

                return [total / this.months.length, total];
            });

            return [
                {
                    id: "categories",
                    class: "data-table fixed scroll-disabled align-left",
                    style: {
                        width: "15%"
                    },
                    header: [
                        i18n.statisticsTable.categoryLabel
                    ],
                    body: this.rows.map((row : MonthStatistics) => {
                        return [row.getCategoryName()];
                    }),
                    footer: [
                        i18n.statisticsTable.totalLabel
                    ]
                },
                {
                    id: "months",
                    class: "data-table scroll-disabled align-right",
                    style: {
                        minWidth: "650px",
                        width: "100%"
                    },
                    header: this.months.map(extractMonthName),
                    body: monthRows,
                    footer: monthTotals
                },
                {
                    id: "summary",
                    class: "data-table fixed align-right",
                    style: {
                        width: "15%"
                    },
                    header: ["Average", "Total"],
                    body: categoryTotals
                        .map((row : Array<number>) => {
                            return row.map((total : number) => formatNumber(total, 2));
                        }),
                    footer: categoryTotals
                        .reduce(
                            (result : Array<number>, row : Array<number>) => {
                                return result.map((total : number, i : number) => total + row[i]);
                            },
                            [0, 0]
                        )
                        .map((total : number) => formatNumber(total, 2))
                }
            ]
        }
    },
    data() {
        return {
            editedCell: null as DataTableCell,
            sortedRows: [] as Array<MonthStatistics>,
            sortingKey: "category",
            sortingDirection: "asc"
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
        },
        scrollingEventHandler(event : Event) {
            this.nonScrollables
                .forEach((column : HTMLElement) => column.scrollTop = (event.target as Element).scrollTop);
        },
        sort(key : string) {
            if (key === this.sortingKey) {
                this.sortingDirection = this.sortingDirection === "asc" ? "desc" : "asc";
            }

            this.sortingKey = key;

            const sorted = [...this.rows].sort((rowA : MonthStatistics, rowB : MonthStatistics) : number => {
                if (this.sortingKey === "category") {
                    const keys = [rowA.getCategoryName(), rowB.getCategoryName()];

                    return keys[0] < keys[1] ? -1 : keys[0] > keys[1] ? 1 : 0;
                }
            });

            this.sortedRows = this.sortingDirection === "asc" ? sorted : sorted.reverse();
        },
        tableData() {
            return new StatisticsTableData(this.months, this.sortedRows, this.onCellEdited);
        }
    },
    mounted() {
        // this.$el.addEventListener("wheel", (event : WheelEvent) => {
        //     const tbody = getTbodyParent(event.target as HTMLElement);
        //
        //     if (!tbody) {
        //         return;
        //     }
        //
        //     this.nonScrollables.forEach((column : HTMLElement) => {
        //         column.scrollTop += 5 * event.deltaY;
        //     });
        // });
        this.scrollController.addEventListener("scroll", this.scrollingEventHandler);
    },
    beforeDestroy() {
        this.scrollController.removeEventListener("scroll", this.scrollingEventHandler);
    },
    props: ["data", "onCellEdited", "months", "rows"],
    template: `
        <div
            class="compound-table"
            v-if="tableVisible"
        >
            <plain-table
                :class="tables[0].class"
                :style="tables[0].style"
                :header="tables[0].header"
                :body="tables[0].body"
                :footer="tables[0].footer"
            />
            <div class="scroll-horizontal" style="width: 70%">
                <plain-table
                    :class="tables[1].class"
                    :style="tables[1].style"
                    :header="tables[1].header"
                    :body="tables[1].body"
                    :footer="tables[1].footer"
                />
            </div>
            <plain-table
                ref="scrollController"
                :class="tables[2].class"
                :style="tables[2].style"
                :header="tables[2].header"
                :body="tables[2].body"
                :footer="tables[2].footer"
            />
        </div>
    `,
    watch: {
        data(data : any) {
            console.log('data changed!');
        }
    }
};
