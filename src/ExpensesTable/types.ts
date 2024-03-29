import {
  DataTableRecord,
  DataTableRecordCollection,
} from './../types/DataTableTypes';

export class ExpensesTableRecordBase implements DataTableRecord {
  protected name: string;
  protected type: string;
  protected value: string | number | string[];

  getName(): string {
    return this.name;
  }

  getType(): string {
    return this.type;
  }

  getValue(): string | number | string[] {
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
    this.type = 'text';
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
    this.type = 'text';
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

    this.name = 'name';
    this.onClickCallback = onClickCallback;
    this.type = 'text';
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

    this.name = 'cost';
    this.onClickCallback = onClickCallback;
    this.type = 'number';
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

    this.name = 'date';
    this.onClickCallback = onClickCallback;
    this.type = 'date';
    this.value = value;
  }

  onClick(): void {
    this.onClickCallback();
  }
}

export class ExpensesTableTagsRecord extends ExpensesTableRecordBase {
  constructor(value: any[]) {
    super();

    this.name = 'tags';
    this.type = 'list';
    this.value = value;
  }

  getValue(): string {
    return (this.value as any[]).map((tag) => tag.name).join(', ');
  }

  isClickable(): boolean {
    return false;
  }

  isEditable(): boolean {
    return false;
  }
}

export class ExpensesTableRecordCollection
  implements DataTableRecordCollection {
  private key: string | number;
  private records: Array<DataTableRecord>;

  constructor(key: string | number, records: Array<DataTableRecord>) {
    this.key = key;
    this.records = records;
  }

  getKey(): string | number {
    return this.key;
  }

  getRecords(): Array<DataTableRecord> {
    return this.records;
  }
}
