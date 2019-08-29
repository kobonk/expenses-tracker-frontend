export interface DataTableRecord {
    getName(): string,
    getType(): string,
    getValue(): string | number | string[],
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

export interface DataTableCell {
    getContent(): string;
    getName(): string,
    isClickable(): boolean;
    isEditable(): boolean;
    onClick(): void;
    toString(): string;
};

export interface DataTableRow {
    getBuilder(): any,
    getCells(): Array<DataTableCell>;
    getId(): string
}

export type TableData = {
    footer: Array<string | Number>,
    header: Array<string | Number>,
    rows: Array<Array<string | Number | DataTableCell> | DataTableRow>
};
