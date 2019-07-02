import i18n from 'utils/i18n';
import "./DataTableForCategoriesStyles.sass";
import { extractMonthName, formatNumber, stringToFloat } from "utils/stringUtils";
import Cell from "./DataTableCell";
import DataTable from "./DataTable";
import PlainTable from "./PlainTable";
import ExpenseCategorySummary from "./../types/ExpenseCategorySummary";
import ExpenseCategoryTableGrid from 'types/ExpenseCategoryTableGrid';
import MonthTotal from "./../types/MonthTotal";
import { DataTableRecord, DataTableRecordCollection, DataTableCell } from "./../types/DataTableTypes";

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

const getFormattedColumnTotals = (grid : ExpenseCategoryTableGrid, months : Array<string>) : Array<string> => {
    return months
        .map((month : string, index : number) => {
            if (!grid) {
                return 0;
            }

            return grid.getColumn(index + 1).reduce(
                (sum : number, cell : DataTableRecord) => sum + stringToFloat(cell.getValue() as string),
                0
            )
        })
        .map((total : number) => formatNumber(total, 2));
};

const getFormattedRowTotals = (grid : ExpenseCategoryTableGrid, months : Array<string>) : Array<Array<number>> => {
    if (!grid) {
        return [[0, 0]];
    }

    return grid.getRows()
        .map((row : Array<DataTableRecord>) => row.slice(1))
        .map((row : Array<DataTableRecord>) => {
            const total = row
                .reduce(
                    (sum : number, cell : DataTableRecord) : number => sum + stringToFloat(cell.getValue()),
                    0
                );

            return [total / months.length, total];
        });
};

class GridHeaderCell implements DataTableRecord {
    private label : string
    private cellClickCallback : Function | null

    constructor(label : string, cellClickCallback : Function) {
        this.label = label;
        this.cellClickCallback = cellClickCallback;
    }

    public getName(): string {
        return this.label;
    }

    public getType() : string {
        return "text";
    }

    public getValue() : string {
        return this.label;
    }

    public isClickable(): boolean {
        return true;
    }

    public isEditable(): boolean {
        return false;
    }

    public onClick(): void {
        this.cellClickCallback();
    }

    public toString(): string {
        return this.getName();
    }
}

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
            return this.grid || this.grid.length > 0;
        },
        tableNodes() : NodeList {
            return this.$el.querySelectorAll("tbody");
        },
        tables() : Array<any> {
            const categoryTotals = getFormattedRowTotals(this.sortedGrid, this.months);

            return [
                {
                    id: "categories",
                    class: "data-table scroll-disabled align-left",
                    style: {
                        width: "220px"
                    },
                    header: [
                        new GridHeaderCell(i18n.categorySummaries.categoryLabel, () => this.sort(0))
                    ],
                    body: !this.sortedGrid ? [] : this.sortedGrid.getColumn(0).map((cell : DataTableRecord) => [cell]),
                    footer: [
                        i18n.categorySummaries.totalLabel
                    ]
                },
                {
                    id: "months",
                    class: "data-table scroll-disabled align-right",
                    style: {},
                    header: this.months.map(extractMonthName),
                    body: !this.sortedGrid ? [] : this.sortedGrid.getRows().map((row : Array<DataTableRecord>) => row.slice(1)),
                    footer: getFormattedColumnTotals(this.sortedGrid, this.months)
                },
                {
                    id: "summary",
                    class: "data-table align-right summary-table",
                    style: {
                        width: "260px"
                    },
                    header: [i18n.categorySummaries.averageLabel, i18n.categorySummaries.totalLabel],
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
            sortedGrid: null as ExpenseCategoryTableGrid,
            sortingColumn: 0,
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
        sort(columnIndex : number, direction : string) {
            if (columnIndex === this.sortingColumn && !direction) {
                this.sortingDirection = this.sortingDirection === "asc" ? "desc" : "asc";
            }

            if (direction) {
                this.sortingDirection = direction;
            }

            this.sortingColumn = columnIndex;

            this.sortedGrid = this.grid.sort(this.sortingColumn, this.sortingDirection);
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

        this.sort(this.sortingColumn, this.sortingDirection);
    },
    beforeDestroy() {
        this.verticalScrollController.removeEventListener("scroll", this.handleVerticalScroll);
        this.$el.removeEventListener("wheel", this.handleVerticalScroll);
        this.horizontalScrollController.removeEventListener("scroll", this.handleHorizontalScroll);
    },
    props: {
        grid: {
            type: ExpenseCategoryTableGrid,
            required: true
        },
        months: {
            type: Array,
            required: true
        },
        onCellEdited: Function,
        rows: {
            type: Array,
            required: true
        }
    },
    template: `
        <div
            class="compound-table"
            v-if="tableVisible"
        >
            <div class="compound-table-row-layout">
                <plain-table
                    :class="tables[0].class"
                    :style="tables[0].style"
                    :header-cells="tables[0].header"
                    :body-cells="tables[0].body"
                    :footer="tables[0].footer"
                />
                <div class="scroll-horizontal">
                    <plain-table
                        :class="tables[1].class"
                        :style="tables[1].style"
                        :header="tables[1].header"
                        :body-cells="tables[1].body"
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
        grid(grid : ExpenseCategoryTableGrid) {
            this.sort(this.sortingColumn, this.sortingDirection);
        }
    }
};
