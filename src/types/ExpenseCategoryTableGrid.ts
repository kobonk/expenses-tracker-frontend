import ExpenseCategory from "types/ExpenseCategory";
import ExpenseCategorySummary from "types/ExpenseCategorySummary";
import MonthTotal from "types/MonthTotal";
import { DataTableRecord } from "./../types/DataTableTypes";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";

class GridCell implements DataTableRecord {
    private category : ExpenseCategory
    private cellClickCallback : Function | null
    private monthTotal : MonthTotal | null

    constructor(category : ExpenseCategory, monthTotal : MonthTotal, cellClickCallback : Function) {
        this.category = category;
        this.monthTotal = monthTotal;
        this.cellClickCallback = cellClickCallback;
    }

    public getName(): string {
        return `${ this.category.getId() }${ this.monthTotal ? "|" : "" }${ this.monthTotal ? this.monthTotal.getMonth() : "" }`;
    }

    public getType() : string {
        return "text";
    }

    public getValue() : string {
        return this.monthTotal ? this.monthTotal.getFormattedTotal() : this.category.getName();
    }

    public isClickable(): boolean {
        return this.monthTotal && this.monthTotal.getTotal() > 0;
    }

    public isEditable(): boolean {
        return false;
    }

    public onClick(): void {
        if (!this.isClickable()) {
            return;
        }

        this.cellClickCallback({ category: this.category, month: this.monthTotal.getMonth() });
    }

    public toString(): string {
        return this.getName();
    }

}

export default class ExpenseCategoryTableGrid {
    private cellClickCallback : Function
    private grid : Array<Array<GridCell>>
    private summaries : Array<ExpenseCategorySummary>

    constructor(summaries : Array<ExpenseCategorySummary>, cellClickCallback : Function) {
        this.cellClickCallback = cellClickCallback;
        this.summaries = summaries;

        this.grid = this.summaries
            .reduce(
                (grid : Array<Array<GridCell>>, summary : ExpenseCategorySummary) : Array<Array<GridCell>> => {
                    const gridRow = [
                        new GridCell(summary.getCategory(), null, null),
                        ...summary.getMonths().map((monthTotal : MonthTotal) => {
                            return new GridCell(summary.getCategory(), monthTotal, cellClickCallback);
                        })
                    ];

                    return [...grid, gridRow];
                },
                []
            );
    }

    getCell(rowIndex : number, columnIndex : number) : GridCell {
        return this.getColumn(columnIndex)[rowIndex];
    }

    getColumn(index : number) : Array<GridCell> {
        return this.grid
            .reduce(
                (result : Array<GridCell>, row : Array<GridCell>) : Array<GridCell> => [...result, row[index]],
                []
            );
    }

    getRow(index : number) : Array<GridCell> {
        return this.grid[index];
    }

    getRows() : Array<Array<GridCell>> {
        return this.grid;
    }

    sort(columnIndex : number, direction : string) : ExpenseCategoryTableGrid {
        console.log("SORT:", columnIndex, direction);
        if (columnIndex === 0) {
            const summaries = [...this.summaries].sort((a : ExpenseCategorySummary, b : ExpenseCategorySummary) : number => {
                if (a.getCategoryName() > b.getCategoryName()) {
                    return 1;
                }

                if (a.getCategoryName() < b.getCategoryName()) {
                    return -1;
                }

                return 0;
            });

            return new ExpenseCategoryTableGrid(direction === "desc" ? summaries.reverse() : summaries, this.cellClickCallback);
        }

        return this;
    }
};
