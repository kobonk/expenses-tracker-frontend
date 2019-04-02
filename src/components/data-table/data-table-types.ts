export interface DataTableRecord {
    getName(): string,
    getType(): string,
    getValue(): string | number,
    isClickable(): boolean,
    isEditable(): boolean,
    onClick(): void,
    toString(): string
}

export interface DataTableRecordCollection {
    getKey(): string | number,
    getRecords(): Array<DataTableRecord>
}

export interface DataTableData {
    getHeader(): Array<DataTableRecordCollection>,
    getBody(): Array<DataTableRecordCollection>,
    getFooter(): Array<DataTableRecordCollection>,
    getSortingDirection(): string,
    getSortingKey(): string
}
