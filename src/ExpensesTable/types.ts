import { DataTableRecord, DataTableRecordCollection } from "./../types/DataTableTypes";

export class ExpensesTableRecordBase implements DataTableRecord {
    protected name: string;
    protected type: string;
    protected value: string | number;

    getName(): string {
        return this.name;
    }

    getType(): string {
        return this.type;
    }

    getValue(): string | number {
        return this.value;
    }

    isClickable(): boolean {
        return true;
    }

    isEditable(): boolean {
        return true;
    }

    onClick(): void {
        // Nothing heppens
    }
}

export class ExpensesTableHeaderRecord extends ExpensesTableRecordBase {
    private onClickCallback: Function;

    constructor(name: string, value: string, onClickCallback: Function) {
        super();

        this.name = name;
        this.onClickCallback = onClickCallback;
        this.type = "text";
        this.value = value;
    }

    isEditable(): boolean {
        return false;
    }

    onClick(): void {
        this.onClickCallback();
    }
}

export class ExpensesTableFooterRecord extends ExpensesTableRecordBase {
    constructor(name: string, value: string) {
        super();

        this.name = name;
        this.type = "text";
        this.value = value;
    }

    isClickable(): boolean {
        return false;
    }

    isEditable(): boolean {
        return false;
    }
}

export class ExpensesTableNameRecord extends ExpensesTableRecordBase {
    private onClickCallback: Function;

    constructor(value: string, onClickCallback: Function) {
        super();

        this.name = "name";
        this.onClickCallback = onClickCallback;
        this.type = "text";
        this.value = value;
    }

    onClick(): void {
        this.onClickCallback();
    }
}

export class ExpensesTableCostRecord extends ExpensesTableRecordBase {
    private onClickCallback: Function;

    constructor(value: string, onClickCallback: Function) {
        super();

        this.name = "cost";
        this.onClickCallback = onClickCallback;
        this.type = "number";
        this.value = value;
    }

    onClick(): void {
        this.onClickCallback();
    }
}

export class ExpensesTableDateRecord extends ExpensesTableRecordBase {
    private onClickCallback: Function;

    constructor(value: string, onClickCallback: Function) {
        super();

        this.name = "purchase_date";
        this.onClickCallback = onClickCallback;
        this.type = "date";
        this.value = value;
    }

    onClick(): void {
        this.onClickCallback();
    }
}

export class ExpensesTableRecordCollection implements DataTableRecordCollection {
    private key: string;
    private records: Array<DataTableRecord>;

    constructor(key: string, records: Array<DataTableRecord>) {
        this.key = key;
        this.records = records;
    }

    getKey(): string {
        return this.key;
    }

    getRecords(): Array<DataTableRecord> {
        return this.records;
    }
}
