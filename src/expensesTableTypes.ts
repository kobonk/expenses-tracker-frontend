import { DataTableCell } from "./components/data-table/data-table";
import { formatNumber } from "utils/stringUtils";

class ExpenseDataTableCell implements DataTableCell {
    getContent() {
        // This has to be overriden
        return "";
    }

    isClickable() {
        return true;
    }

    onClick() {
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

    getContent() {
        return formatNumber(this.value);
    }

    onClick() {
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

    getContent() {
        return this.content;
    }

    onClick() {
        this.onTableCellClicked(this.expenseId, this.content);
    }
}

export { ExpenseDataTableCellNumber, ExpenseDataTableCellString };
