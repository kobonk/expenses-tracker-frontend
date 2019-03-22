import { DataTableCell, DataTableRow } from "./components/data-table/data-table";
import { formatNumber } from "utils/stringUtils";

class ExpensesDataTableRow implements DataTableRow {
    private expenseId: string;
    private cells: Array<ExpenseDataTableCell>;

    constructor(expenseId: string, cells: Array<ExpenseDataTableCell>) {
        this.expenseId = expenseId;
        this.cells = cells;
    }

    getId(): string {
        return this.expenseId;
    }

    getCells(): Array<DataTableCell> {
        return this.cells as Array<DataTableCell>;
    }
}

class ExpenseDataTableCell implements DataTableCell {
    public getContent(): string {
        // This has to be overriden
        return "";
    }

    public getName(): string {
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
    private name: string;
    private onTableCellClicked: Function;
    private value: number;

    constructor(name: string, value: number, onTableCellClicked: Function) {
        super();

        this.name = name;
        this.onTableCellClicked = onTableCellClicked;
        this.value = value;
    }

    getContent(): string {
        return formatNumber(this.value);
    }

    getName(): string {
        return this.name;
    }

    onClick(): void {
        this.onTableCellClicked({ [this.name]: this.value });
    }
}

class ExpenseDataTableCellString extends ExpenseDataTableCell {
    private name: string;
    private onTableCellClicked: Function;
    private content: string;

    constructor(name:string, content: string, onTableCellClicked: Function) {
        super();

        this.content = content;
        this.name = name;
        this.onTableCellClicked = onTableCellClicked;
    }

    getContent(): string {
        return this.content;
    }

    getName(): string {
        return this.name;
    }

    onClick(): void {
        this.onTableCellClicked({ [this.name]: this.content });
    }
}

export { ExpenseDataTableCellNumber, ExpenseDataTableCellString, ExpensesDataTableRow };
