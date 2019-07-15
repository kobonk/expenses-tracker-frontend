import ExpenseCategorySummary from "types/ExpenseCategorySummary";
import { DataTableRecord } from "types/DataTableTypes";
import MonthTotal from "types/MonthTotal";
import { CategoryBodyGridCell, CategoryBodyGridCellCheckbox } from "./ExpenseCategoryTableGridTypes";

const sortSummariesByCategory = (summaries : Array<ExpenseCategorySummary>) : Array<ExpenseCategorySummary> => {
    return [...summaries].sort((a : ExpenseCategorySummary, b : ExpenseCategorySummary) : number => {
        if (a.getCategoryName() > b.getCategoryName()) {
            return 1;
        }

        return a.getCategoryName() < b.getCategoryName() ? -1 : 0;
    });
};

const sortSummariesByMonthColumn = (summaries : Array<ExpenseCategorySummary>, columnIndex : number) : Array<ExpenseCategorySummary> => {
    return [...summaries].sort((a : ExpenseCategorySummary, b : ExpenseCategorySummary) : number => {
        const aMonth = a.getMonths()[columnIndex];
        const bMonth = b.getMonths()[columnIndex];

        if (aMonth.getTotal() > bMonth.getTotal()) {
            return 1;
        }

        return aMonth.getTotal() < bMonth.getTotal() ? -1 : 0;
    });
};

const sortSummariesByAverage = (summaries : Array<ExpenseCategorySummary>) : Array<ExpenseCategorySummary> => {
    return [...summaries].sort((a : ExpenseCategorySummary, b : ExpenseCategorySummary) : number => {
        if (a.getAverage() > b.getAverage()) {
            return 1;
        }

        return a.getAverage() < b.getAverage() ? -1 : 0;
    });
};

const sortSummariesByTotal = (summaries : Array<ExpenseCategorySummary>) : Array<ExpenseCategorySummary> => {
    return [...summaries].sort((a : ExpenseCategorySummary, b : ExpenseCategorySummary) : number => {
        if (a.getTotal() > b.getTotal()) {
            return 1;
        }

        return a.getTotal() < b.getTotal() ? -1 : 0;
    });
};

const getRowTotalCell = (summary : ExpenseCategorySummary) : CategoryBodyGridCell => {
    return new CategoryBodyGridCell(summary.getCategory(), new MonthTotal(MonthTotal.FAKE_MONTH, summary.getTotal()), null);
};

const getRowAverageCell = (summary : ExpenseCategorySummary) : CategoryBodyGridCell => {
    return new CategoryBodyGridCell(summary.getCategory(), new MonthTotal(MonthTotal.FAKE_MONTH, summary.getAverage()), null);
};

const sortSummaries = (summaries : Array<ExpenseCategorySummary>, columnIndex : number) : Array<ExpenseCategorySummary> => {
    if (columnIndex === 0) {
        return sortSummariesByCategory(summaries);
    }

    if (columnIndex === summaries[0].getMonths().length + 1) {
        return sortSummariesByAverage(summaries);
    }

    if (columnIndex === summaries[0].getMonths().length + 2) {
        return sortSummariesByTotal(summaries);
    }

    return sortSummariesByMonthColumn(summaries, columnIndex - 1);
};

export default class ExpenseCategoryTableGrid {
    private cellClickCallback : Function
    private grid : Array<Array<DataTableRecord>>
    private summaries : Array<ExpenseCategorySummary>

    constructor(summaries : Array<ExpenseCategorySummary>, cellClickCallback : Function) {
        this.cellClickCallback = cellClickCallback;
        this.summaries = summaries;

        this.grid = this.summaries
            .reduce(
                (grid : Array<Array<CategoryBodyGridCell>>, summary : ExpenseCategorySummary) : Array<Array<DataTableRecord>> => {
                    const totalCell = getRowTotalCell(summary);
                    const averageCell = getRowAverageCell(summary);

                    const gridRow = [
                        new CategoryBodyGridCell(summary.getCategory(), null, null),
                        ...summary.getMonths().map((monthTotal : MonthTotal) => {
                            return new CategoryBodyGridCell(summary.getCategory(), monthTotal, cellClickCallback);
                        }),
                        averageCell,
                        totalCell
                    ];

                    return [...grid, gridRow];
                },
                []
            );
    }

    getCell(rowIndex : number, columnIndex : number) : DataTableRecord {
        return this.getColumn(columnIndex)[rowIndex];
    }

    getColumn(index : number) : Array<DataTableRecord> {
        return this.grid
            .reduce(
                (result : Array<CategoryBodyGridCell>, row : Array<CategoryBodyGridCell>) : Array<CategoryBodyGridCell> => [...result, row[index]],
                []
            );
    }

    getColumns(startingIndex : number, count : number) : Array<Array<DataTableRecord>> {
        return this.grid
            .reduce(
                (result : Array<Array<DataTableRecord>>, row : Array<DataTableRecord>) : Array<Array<DataTableRecord>> => {
                    return [...result, row.slice(startingIndex, startingIndex + count)];
                },
                []
            )
    }

    getColumnCount() : number {
        if (!this.summaries || this.summaries.length <= 0) {
            return 0;
        }

        return this.summaries[0].getMonths().length + 3; // 1 column for category name, 1 for Average, 1 for Total = 3
    }

    getRow(index : number) : Array<DataTableRecord> {
        return this.grid[index];
    }

    getRows() : Array<Array<DataTableRecord>> {
        return this.grid;
    }

    sort(columnIndex : number, direction : string) : ExpenseCategoryTableGrid {
        const summaries = sortSummaries(this.summaries, columnIndex);

        return new ExpenseCategoryTableGrid(direction === "desc" ? summaries.reverse() : summaries, this.cellClickCallback);
    }
};
