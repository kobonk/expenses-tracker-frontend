import ExpenseCategory from "types/ExpenseCategory";
import MonthTotal from "types/MonthTotal";
import { DataTableRecord } from "./../types/DataTableTypes";
import { formatNumber } from "utils/stringUtils";
import { timeThursday } from "d3";

export class BaseCategoryGridCell implements DataTableRecord {
    public getName() : string {
        throw new Error("Not Implemented");
    }

    public getType() : string {
        return "text";
    }

    public getValue() : string {
        return this.getName();
    }

    public isClickable() : boolean {
        return false;
    }

    public isEditable() : boolean {
        return false;
    }

    public onClick() : void {
        throw new Error("Not Implemented");
    }

    public toString() : string {
        return this.getName();
    }
}

export class CategoryHeaderGridCell extends BaseCategoryGridCell {
    private label : string
    private cellClickCallback : Function | null

    constructor(label : string, cellClickCallback : Function) {
        super();
        this.label = label;
        this.cellClickCallback = cellClickCallback;
    }

    public getName() : string {
        return this.label;
    }

    public isClickable(): boolean {
        return true;
    }

    public onClick(): void {
        this.cellClickCallback();
    }
}

export class CategoryFooterGridCellNumeric extends BaseCategoryGridCell {
    private total : number

    constructor(total : number) {
        super();
        this.total = total;
    }

    public getName() : string {
        return formatNumber(this.total, 2);
    }
}

export class CategoryFooterGridCellText extends BaseCategoryGridCell {
    private label : string

    constructor(label : string) {
        super();
        this.label = label;
    }

    public getName() : string {
        return this.label;
    }
}

export class CategoryBodyGridCell extends BaseCategoryGridCell {
    private category : ExpenseCategory
    private cellClickCallback : Function | null
    private monthTotal : MonthTotal | null

    constructor(category : ExpenseCategory, monthTotal : MonthTotal, cellClickCallback : Function) {
        super();
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
        return this.monthTotal && this.monthTotal.getTotal() > 0 && this.monthTotal.getMonth() !== MonthTotal.FAKE_MONTH;
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

export class CategoryBodyGridCellCheckbox extends BaseCategoryGridCell {
    private value : string
    private cellClickCallback : Function | null

    constructor(value : string, cellClickCallback : Function) {
        super();
        this.value = value;
        this.cellClickCallback = cellClickCallback;
    }

    public getName() : string {
        return this.value;
    }

    public getType() : string {
        return "checkbox";
    }

    public isClickable(): boolean {
        return true;
    }

    public onClick(): void {
        this.cellClickCallback(this.value);
    }
}
