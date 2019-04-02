import Expense from "types/Expense";
import { formatNumber } from "utils/stringUtils";
import i18n from "utils/i18n";

import {
    DataTableData,
    DataTableRecord,
    DataTableRecordCollection
} from "./../components/data-table/data-table-types";

import {
    ExpensesTableHeaderRecord,
    ExpensesTableFooterRecord,
    ExpensesTableNameRecord,
    ExpensesTableCostRecord,
    ExpensesTableDateRecord,
    ExpensesTableRecordCollection
} from "./types";

const _ = require("lodash");

class ExpensesTableData implements DataTableData {
    private sortingKey: string;
    private sortingDirection: string;

    private header: Array<DataTableRecordCollection>;
    private body: Array<DataTableRecordCollection>;
    private footer: Array<DataTableRecordCollection>;

    constructor(expenses: Array<Expense>) {
        this.header = this.createHeader();
        this.body = this.createBody(expenses);
        this.footer = this.createFooter(expenses);

        this.sortingKey = "date";
        this.sortingDirection = "asc";

        this.sort(this.sortingKey);
    }

    public getHeader(): Array<DataTableRecordCollection> {
        return this.header;
    }

    public getBody(): Array<DataTableRecordCollection> {
        return this.body;
    }

    public getFooter(): Array<DataTableRecordCollection> {
        return this.footer;
    }

    public getSortingDirection(): string {
        return this.sortingDirection;
    }

    public getSortingKey(): string {
        return this.sortingKey;
    }

    private createHeader(): Array<DataTableRecordCollection> {
        const records: Array<DataTableRecord> = [
            new ExpensesTableHeaderRecord("name", i18n.expensesTable.expenseLabel, () => this.sort("name")),
            new ExpensesTableHeaderRecord("cost", i18n.expensesTable.costLabel, () => this.sort("cost")),
            new ExpensesTableHeaderRecord("date", i18n.expensesTable.dateLabel, () => this.sort("date"))
        ];

        return [new ExpensesTableRecordCollection("header", records)];
    }

    private createBody(expenses: Array<Expense>): Array<DataTableRecordCollection> {
        return _.map(expenses, (expense: Expense): DataTableRecordCollection => {
            const onClick = (id: string, value: string | number) => console.log(id, value);

            return new ExpensesTableRecordCollection(
                expense.getId(),
                [
                    new ExpensesTableNameRecord(expense.getName(), onClick),
                    new ExpensesTableCostRecord(formatNumber(expense.getCost()), onClick),
                    new ExpensesTableDateRecord(expense.getDate(), onClick)
                ]
            );
        });
    }

    private createFooter(expenses: Array<Expense>): Array<DataTableRecordCollection> {
        const records: Array<DataTableRecord> = [
            new ExpensesTableFooterRecord("name", i18n.expensesTable.totalLabel),
            new ExpensesTableFooterRecord(
                "cost",
                formatNumber(
                    _.reduce(
                        expenses,
                        (result: number, expense: Expense): number => result + expense.getCost(),
                        0
                    )
                )
            ),
            new ExpensesTableFooterRecord("date", "")
        ];

        return [new ExpensesTableRecordCollection("header", records)];
    }

    private sort(key: string) {
        if (key === this.sortingKey) {
            this.sortingDirection = this.sortingDirection === "asc" ? "desc" : "asc";
        }

        this.sortingKey = key;

        const sorted = _.sortBy(this.body, (row: DataTableRecordCollection) => {
            const result = _.chain(row.getRecords())
            .find((record: DataTableRecord) => record.getName() === this.sortingKey)
            .value();

            const numericValue = parseFloat(result.getValue().replace(/\s/g, ""));

            return isNaN(numericValue) ? result.getValue() : numericValue;
        });

        this.body = this.sortingDirection === "asc" ? sorted : sorted.reverse();
    }
}

export { ExpensesTableData };
