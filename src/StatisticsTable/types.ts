import { formatNumber } from "utils/stringUtils";
import { DataTableRecord, DataTableRecordCollection } from "./../data-table/data-table-types";

const _ = require("lodash");

export class StatisticsRecordCollection implements DataTableRecordCollection {
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

class StatisticsRecordBase implements DataTableRecord {
    protected name: string;
    protected value: string;

    getName(): string {
        return this.name;
    }

    getType(): string {
        return "text";
    }

    getValue(): string {
        return this.value;
    }

    isClickable(): boolean {
        return false;
    }

    isEditable(): boolean {
        return false;
    }

    onClick(): void {
        // Nothing happens
    }
}

export class StatisticsEmptyRecord extends StatisticsRecordBase {
    constructor(name: string) {
        super();

        this.name = name;
        this.value = formatNumber(0);
    }
}

export class StatisticsCategoryRecord extends StatisticsRecordBase {
    constructor(name: string, value: string) {
        super();

        this.name = name;
        this.value = value;
    }
}

export class StatisticsMonthRecord extends StatisticsRecordBase {
    private onClickCallback: Function;

    constructor(name: string, value: string, onClickCallback: Function) {
        super();

        this.name = name;
        this.value = value;
        this.onClickCallback = onClickCallback;
    }

    isClickable(): boolean {
        return true;
    }

    onClick(): void {
        this.onClickCallback(this.name);
    }
}

export class StatisticsHeaderRecord extends StatisticsRecordBase {
    private onClickCallback: Function;

    constructor(name: string, value: string, onClickCallback: Function) {
        super();

        this.name = name;
        this.value = value;
        this.onClickCallback = onClickCallback;
    }

    isClickable(): boolean {
        return true;
    }

    onClick(): void {
        this.onClickCallback();
    }
}

export class StatisticsFooterRecord extends StatisticsRecordBase {
    constructor(value: string) {
        super();

        this.value = value;
    }
}
