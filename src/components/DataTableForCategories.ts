import i18n from 'utils/i18n';
import { extractMonthName, stringToFloat } from "utils/stringUtils";
import { getFirstParentOfType } from "utils/domUtils";
import Cell from "./DataTableCell";
import PlainTable from "./PlainTable";
import ExpenseCategoryTableGrid, { ExpenseCategoryTableGridRow } from 'types/ExpenseCategoryTableGrid';
import {
    CategoryBodyGridCellCheckbox,
    CategoryHeaderGridCell,
    CategoryFooterGridCellNumeric,
    CategoryFooterGridCellText
} from 'types/ExpenseCategoryTableGridTypes';
import { DataTableCell } from "./../types/DataTableTypes";

const createCategoryTableBody = (grid : ExpenseCategoryTableGrid, onClickCallback : Function) : Array<ExpenseCategoryTableGridRow> => {
    if (!grid) {
        return [];
    }

    return grid.getColumns(0, 1)
        .map((row : ExpenseCategoryTableGridRow) => {
            const checkboxCell = new CategoryBodyGridCellCheckbox(row.getId(), onClickCallback);
            const categoryCell = row.getCell(0);

            return new ExpenseCategoryTableGridRow(row.getId(), [checkboxCell, categoryCell]);
        });
};

const convertArraysToFooterRows = (rows : Array<Array<number | string>>, idPattern : string) : Array<ExpenseCategoryTableGridRow> => {
    return rows
        .map((row : Array<number>, i : number) => {
            return new ExpenseCategoryTableGridRow(
                `${ idPattern }-${ i + 1 }`,
                row.map((value : number | string) => {
                    if (typeof value === "number") {
                        return new CategoryFooterGridCellNumeric(value as number);
                    }

                    return new CategoryFooterGridCellText(value as string);
                })
            );
        });
};

export default {
    components: {
        "plain-table": PlainTable,
        "table-cell": Cell
    },
    computed: {
        horizontalScrollController() : HTMLElement {
            return this.$el.querySelector(".compound-table-horizontal-scroll .scroll-horizontal");
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
            const categoryTableBody = createCategoryTableBody(this.sortedGrid, this.selectRow);

            const categoryTableFooter = convertArraysToFooterRows(this.getCategoryTableFooterValues(), "footer-category");
            const monthTableFooter = convertArraysToFooterRows(this.calculateMonthTableFooterValues(), "footer-month");
            const summaryTableFooter = convertArraysToFooterRows(this.calculateSummaryTableFooterValues(), "footer-total");

            return [
                {
                    id: "categories",
                    class: "data-table scroll-disabled align-left categories",
                    style: {
                        width: "270px"
                    },
                    header: [
                        new CategoryHeaderGridCell("", null),
                        new CategoryHeaderGridCell(i18n.categorySummaries.categoryLabel, () => this.sort(0))
                    ],
                    body: categoryTableBody,
                    footer: categoryTableFooter
                },
                {
                    id: "months",
                    class: "data-table scroll-disabled align-right",
                    style: {},
                    header: this.months.map((month : string, i : number) => new CategoryHeaderGridCell(extractMonthName(month), () => this.sort(i + 1))),
                    body: !this.sortedGrid ? [] : this.sortedGrid.getColumns(1, this.months.length),
                    footer: monthTableFooter
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
                    body: !this.sortedGrid ? [] : this.sortedGrid.getRows().map((row : ExpenseCategoryTableGridRow) => new ExpenseCategoryTableGridRow(row.getId(), row.getCells(-2, undefined))),
                    footer: summaryTableFooter
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
            checkedRows: [] as Array<string>,
            editedCell: null as DataTableCell,
            sortedGrid: null as ExpenseCategoryTableGrid,
            sortedColumn: 0,
            sortingDirection: "asc"
        }
    },
    methods: {
        calculateColumnTotal(columnIndex : number, filterCallback : Function = this.isRowSelected) : number {
            if (!this.sortedGrid) {
                return 0;
            }

            return this.sortedGrid.getRows()
                .filter(filterCallback)
                .reduce(
                    (sum : number, row : ExpenseCategoryTableGridRow, i : number) => {
                        if (!row.getCell(columnIndex)) {
                            return sum;
                        }

                        return sum + stringToFloat(row.getCell(columnIndex).getValue())
                    },
                    0
                );
        },
        calculateMonthTableFooterValues() : Array<Array<number>> {
            return [
                this.months
                    .map((month : string, index : number) => {
                        return this.calculateColumnTotal(index + 1);
                    }),
                this.months
                    .map((month : string, index : number) => {
                        return this.calculateColumnTotal(index + 1, this.isRowNotSelected);
                    }),
                this.months
                    .map((month : string, index : number) => {
                        return this.calculateColumnTotal(index + 1, () => true);
                    })
            ];
        },
        calculateSummaryTableFooterValues() : Array<Array<number>> {
            if (!this.sortedGrid) {
                return [
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0]
                ];
            }

            const columnCount = this.sortedGrid.getColumnCount();
            const indices = [columnCount - 2, columnCount - 1];

            return [
                indices.map((index : number) => this.calculateColumnTotal(index)),
                indices.map((index : number) => this.calculateColumnTotal(index, this.isRowNotSelected)),
                indices.map((index : number) => this.calculateColumnTotal(index, () => true))
            ];
        },
        getCategoryTableFooterValues() : Array<Array<string>> {
            return [
                ["", i18n.categorySummaries.totalSelectedLabel],
                ["", i18n.categorySummaries.totalNotSelectedLabel],
                ["", i18n.categorySummaries.totalAllLabel]
            ];
        },
        handleHorizontalScroll(event : Event) {
            this.scrollMonthsTableHorizontally((event.target as HTMLElement).scrollLeft);
        },
        handleVerticalScroll(event : Event) {
            const tbody = getFirstParentOfType(event.target as HTMLElement, "tbody");

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
        isRowNotSelected(row : ExpenseCategoryTableGridRow) : boolean {
            return !this.isRowSelected(row);
        },
        isRowSelected(row : ExpenseCategoryTableGridRow) : boolean {
            return this.checkedRows.includes(row.getId());
        },
        onWindowResized() {
            this.synchronizeTableSizes();
            this.synchronizeHorizontallScrollerSize();
        },
        selectAllRows() {
            this.checkedRows = this.sortedGrid.getRows().map((row : ExpenseCategoryTableGridRow) => row.getId());
        },
        selectRow(categoryId : string) {
            if (!categoryId) {
                return;
            }

            const index = this.checkedRows.indexOf(categoryId);

            if (index !== -1) {
                this.checkedRows.splice(index, 1);
            } else {
                this.checkedRows.push(categoryId);
            }
        },
        scrollMonthsTableHorizontally(distance : number) {
            const nodes = this.$el.querySelectorAll(".compound-table-row-layout .scroll-horizontal, .compound-table-row-layout .scroll-horizontal table");

            nodes.forEach((node : HTMLElement) => {
                node.scrollLeft = distance;
            });
        },
        synchronizeHorizontallScrollerSize() {
            const scrollableContentTableBody = this.tableNodes[1];
            const scrollableContentContainer = getFirstParentOfType(this.tableNodes[1], "div");
            const horizontalScrollHandle = this.horizontalScrollController.querySelector("div");

            if (scrollableContentContainer.clientWidth < scrollableContentTableBody.clientWidth) {
                horizontalScrollHandle.style.width = `${scrollableContentTableBody.clientWidth}px`;
            } else {
                horizontalScrollHandle.style.width = null;
            }

        },
        synchronizeTableSizes() {
            const properHeightTableBody = this.tableNodes[0];
            const wrongHeightTableBody = this.tableNodes[1];

            wrongHeightTableBody.style.height = `${properHeightTableBody.clientHeight}px`
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
        window.addEventListener("resize", this.onWindowResized);

        this.sort(this.sortedColumn, this.sortingDirection);
        this.selectAllRows();
    },
    beforeDestroy() {
        this.verticalScrollController.removeEventListener("scroll", this.handleVerticalScroll);
        this.$el.removeEventListener("wheel", this.handleVerticalScroll);
        this.horizontalScrollController.removeEventListener("scroll", this.handleHorizontalScroll);
        window.removeEventListener("resize", this.onWindowResized);
    },
    updated() {
        this.onWindowResized();
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
                    :checked-rows="checkedRows"
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
                        :checked-rows="checkedRows"
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
                    :checked-rows="checkedRows"
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
        grid(newGrid : ExpenseCategoryTableGrid, oldGrid : ExpenseCategoryTableGrid) {
            this.sort(this.sortedColumn, this.sortingDirection);

            if (this.checkedRows.length === 0) {
                this.selectAllRows();
            }

            if (newGrid.getRows().length !== oldGrid.getRows().length) {
                this.selectAllRows();
            }
        }
    }
};
