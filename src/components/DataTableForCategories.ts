import i18n from 'utils/i18n';
import "./DataTableForCategoriesStyles.sass";
import { extractMonthName, stringToFloat } from "utils/stringUtils";
import Cell from "./DataTableCell";
import DataTable from "./DataTable";
import PlainTable from "./PlainTable";
import ExpenseCategoryTableGrid from 'types/ExpenseCategoryTableGrid';
import {
    CategoryHeaderGridCell,
    CategoryFooterGridCellNumeric,
    CategoryFooterGridCellText
} from 'types/ExpenseCategoryTableGridTypes';
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

const getMonthColumnTotals = (grid : ExpenseCategoryTableGrid, months : Array<string>) : Array<number> => {
    return months
        .map((month : string, index : number) => {
            if (!grid) {
                return 0;
            }

            return calculateColumnTotal(grid, index + 1);
        });
};

const calculateColumnTotal = (grid : ExpenseCategoryTableGrid, columnIndex : number) : number => {
    return grid.getRows()
        .reduce(
            (sum : number, row : Array<DataTableRecord>) => {
                return sum + stringToFloat(row[columnIndex].getValue())
            },
            0
        );
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
            return this.grid || this.grid.length > 0;
        },
        tableNodes() : NodeList {
            return this.$el.querySelectorAll("tbody");
        },
        tables() : Array<any> {
            const finalTotal = !this.sortedGrid ? 0 : calculateColumnTotal(this.sortedGrid, this.sortedGrid.getColumnCount() - 1);
            const finalAverage = !this.sortedGrid ? 0 : calculateColumnTotal(this.sortedGrid, this.sortedGrid.getColumnCount() - 2);

            return [
                {
                    id: "categories",
                    class: "data-table scroll-disabled align-left",
                    style: {
                        width: "220px"
                    },
                    header: [
                        new CategoryHeaderGridCell(i18n.categorySummaries.categoryLabel, () => this.sort(0))
                    ],
                    body: !this.sortedGrid ? [] : this.sortedGrid.getColumn(0).map((cell : DataTableRecord) => [cell]),
                    footer: [
                        new CategoryFooterGridCellText(i18n.categorySummaries.totalLabel)
                    ]
                },
                {
                    id: "months",
                    class: "data-table scroll-disabled align-right",
                    style: {},
                    header: this.months.map((month : string, i : number) => new CategoryHeaderGridCell(extractMonthName(month), () => this.sort(i + 1))),
                    body: !this.sortedGrid ? [] : this.sortedGrid.getRows().map((row : Array<DataTableRecord>) => row.slice(1, this.months.length + 1)),
                    footer: getMonthColumnTotals(this.sortedGrid, this.months).map((total : number) => new CategoryFooterGridCellNumeric(total))
                },
                {
                    id: "summary",
                    class: "data-table align-right summary-table",
                    style: {
                        width: "260px"
                    },
                    header: [
                        new CategoryHeaderGridCell(i18n.categorySummaries.averageLabel, () => this.sort(this.sortedGrid.getColumnCount() - 2)),
                        new CategoryHeaderGridCell(i18n.categorySummaries.totalLabel, () => this.sort(this.sortedGrid.getColumnCount() - 1))
                    ],
                    body: !this.sortedGrid ? [] : this.sortedGrid.getRows().map((row : Array<DataTableRecord>) => row.slice(-2)),
                    footer: [
                        new CategoryFooterGridCellNumeric(finalAverage),
                        new CategoryFooterGridCellNumeric(finalTotal)
                    ]
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
            sortedColumn: 0,
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
            if (columnIndex === this.sortedColumn && !direction) {
                this.sortingDirection = this.sortingDirection === "asc" ? "desc" : "asc";
            }

            if (direction) {
                this.sortingDirection = direction;
            }

            this.sortedColumn = columnIndex;

            this.sortedGrid = this.grid.sort(this.sortedColumn, this.sortingDirection);
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

        this.sort(this.sortedColumn, this.sortingDirection);
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
                    :header="tables[0].header"
                    :body="tables[0].body"
                    :footer="tables[0].footer"
                    :sortedColumn="sortedColumn === 0 ? 0 : null"
                    :sortingDirection="sortingDirection"
                />
                <div class="scroll-horizontal">
                    <plain-table
                        :class="tables[1].class"
                        :style="tables[1].style"
                        :header="tables[1].header"
                        :body="tables[1].body"
                        :footer="tables[1].footer"
                        :sortedColumn="sortedColumn > 0 ? sortedColumn - 1 : null"
                        :sortingDirection="sortingDirection"
                    />
                </div>
                <plain-table
                    ref="verticalScrollController"
                    :class="tables[2].class"
                    :style="tables[2].style"
                    :header="tables[2].header"
                    :body="tables[2].body"
                    :footer="tables[2].footer"
                    :sortedColumn="sortedColumn > 0 ? sortedColumn - months.length - 1 : null"
                    :sortingDirection="sortingDirection"
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
            this.sort(this.sortedColumn, this.sortingDirection);
        }
    }
};
