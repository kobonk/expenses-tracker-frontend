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

const getFirstTbodyParent = (element : HTMLElement) : HTMLElement => {
    if (!element) {
        return null;
    }

    if ((/tbody/i).test(element.tagName)) {
        return element;
    }

    if (!element.parentElement) {
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
        horizontalScrollController() : HTMLElement {
            return this.$el.querySelector(".compound-table-horizontal-scroll .scroll-horizontal");
        },
        horizontalScrollTarget() : HTMLElement {
            return this.$el.querySelector(".compound-table-row-layout .scroll-horizontal table");
        },
        monthColumns() : Array<any> {
            return this.months
                .map((month : string) => {
                    return {
                        id: month,
                        name: extractMonthName(month)
                    };
                });
        },
        tableVisible() : boolean {
            return this.data || this.data.getBody().length > 0;
        },
        tableNodes() : NodeList {
            return this.$el.querySelectorAll("tbody");
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
                    class: "data-table scroll-disabled align-left",
                    style: {
                        width: "220px"
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
                    style: {},
                    header: this.months.map(extractMonthName),
                    body: monthRows,
                    footer: monthTotals
                },
                {
                    id: "summary",
                    class: "data-table align-right summary-table",
                    style: {
                        width: "260px"
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
        },
        verticalScrollTargets() : NodeList {
            return this.$el.querySelectorAll('.scroll-disabled tbody');
        },
        verticalScrollController() : HTMLElement {
            return this.$refs["verticalScrollController"].$el.querySelector('table:last-child tbody');
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
        handleHorizontalScroll(event : Event) {
            this.horizontalScrollTarget.scrollLeft = (event.target as HTMLElement).scrollLeft;
        },
        handleVerticalScroll(event : Event) {
            const tbody = getFirstTbodyParent(event.target as HTMLElement);

            if (!tbody) {
                return;
            }

            this.tableNodes
                .forEach((tableBody : HTMLElement) => {
                    if ((/scroll/i).test(event.type)) {
                        tableBody.scrollTop = (event.target as Element).scrollTop;
                    }

                    if ((event as WheelEvent).deltaY) {
                        const wheelFactor = (event as WheelEvent).deltaMode === 0 ? 0.25 : 5;
                        tableBody.scrollTop += wheelFactor * (event as WheelEvent).deltaY;
                    }
                });
        },
        observeWidthChange(mutationsList : Array<MutationRecord>) {
            const childListChange = mutationsList.find((mutation : MutationRecord) => mutation.type === "childList");

            if (childListChange) {
                this.horizontalScrollTarget.querySelectorAll("thead, tbody, tfoot")
                    .forEach((element : HTMLElement) => {
                        element.style.width = `${this.horizontalScrollTarget.scrollWidth}px`;
                    });

                this.horizontalScrollController.querySelector("div").style.width = `${this.horizontalScrollTarget.scrollWidth}px`;
            }
        },
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
        this.verticalScrollController.addEventListener("scroll", this.handleVerticalScroll);
        this.$el.addEventListener("wheel", this.handleVerticalScroll);
        this.horizontalScrollController.addEventListener("scroll", this.handleHorizontalScroll);

        this.widthChangeObserver = new MutationObserver(this.observeWidthChange);
        this.widthChangeObserver.observe(
            this.horizontalScrollTarget,
            { attributes: true, childList: true, subtree: true }
        );
    },
    beforeDestroy() {
        this.verticalScrollController.removeEventListener("scroll", this.handleVerticalScroll);
        this.$el.removeEventListener("wheel", this.handleVerticalScroll);
        this.horizontalScrollController.removeEventListener("scroll", this.handleHorizontalScroll);
    },
    props: ["data", "onCellEdited", "months", "rows"],
    template: `
        <div
            class="compound-table"
            v-if="tableVisible"
        >
            <div class="compound-table-row-layout">
                <plain-table
                    :class="tables[0].class"
                    :style="tables[0].style"
                    :header="tables[0].header"
                    :body="tables[0].body"
                    :footer="tables[0].footer"
                />
                <div class="scroll-horizontal">
                    <plain-table
                        :class="tables[1].class"
                        :style="tables[1].style"
                        :header="tables[1].header"
                        :body="tables[1].body"
                        :footer="tables[1].footer"
                    />
                </div>
                <plain-table
                    ref="verticalScrollController"
                    :class="tables[2].class"
                    :style="tables[2].style"
                    :header="tables[2].header"
                    :body="tables[2].body"
                    :footer="tables[2].footer"
                />
            </div>
            <div class="compound-table-row-layout compound-table-horizontal-scroll">
                <div
                    :class="tables[0].class"
                    :style="tables[0].style"
                />
                <div class="scroll-horizontal" style="width: 70%">
                    <div
                        :class="tables[1].class"
                        :style="tables[1].style"
                    />
                </div>
                <div
                    :class="tables[2].class"
                    :style="tables[2].style"
                />
            </div>
        </div>
    `,
    watch: {
        data(data : any) {
            console.log('data changed!');
        }
    }
};
