import { DataTableCell } from "./components/data-table/data-table";
import { formatNumber } from "utils/stringUtils";

class ExpenseDataTableCell implements DataTableCell {
    public getContent(): string {
        // This has to be overriden
        return "";
    }

    public isClickable(): boolean {
        return true;
    }

    public isEditable(): boolean {
        return true;
    }

    public onClick(): void {
        // This has to be overriden
    }
}

class ExpenseDataTableCellNumber extends ExpenseDataTableCell {
    private expenseId: string;
    private onTableCellClicked: Function;
    private value: number;

    constructor(expenseId: string, value: number, onTableCellClicked: Function) {
        super();

        this.expenseId = expenseId;
        this.onTableCellClicked = onTableCellClicked;
        this.value = value;
    }

    getContent(): string {
        return formatNumber(this.value);
    }

    onClick(): void {
        this.onTableCellClicked(this.expenseId, this.value);
    }
}

class ExpenseDataTableCellString extends ExpenseDataTableCell {
    private expenseId: string;
    private onTableCellClicked: Function;
    private content: string;

    constructor(expenseId: string, content: string, onTableCellClicked: Function) {
        super();

        this.content = content;
        this.expenseId = expenseId;
        this.onTableCellClicked = onTableCellClicked;
    }

    getContent(): string {
        return this.content;
    }

    onClick(): void {
        this.onTableCellClicked(this.expenseId, this.content);
    }
}

export { ExpenseDataTableCellNumber, ExpenseDataTableCellString };
