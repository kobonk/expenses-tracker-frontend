export interface DataTableRecord {
    getName(): string;
    getValue(): string | number;
    isClickable(): boolean;
    isEditable(): boolean;
    onClick(): void;
    toString(): string;
}

export interface DataTableRecordCollection {
    getKey(): string | number;
    getRecords(): Array<DataTableRecord>
}
