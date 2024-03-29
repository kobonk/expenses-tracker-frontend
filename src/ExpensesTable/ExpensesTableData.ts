import Expense from 'types/Expense';
import { formatNumber } from 'utils/stringUtils';
import i18n from 'utils/i18n';

import {
  DataTableData,
  DataTableRecord,
  DataTableRecordCollection,
} from './../types/DataTableTypes';

import {
  ExpensesTableHeaderRecord,
  ExpensesTableFooterRecord,
  ExpensesTableNameRecord,
  ExpensesTableCostRecord,
  ExpensesTableDateRecord,
  ExpensesTableRecordCollection,
  ExpensesTableTagsRecord,
} from './types';

const _ = require('lodash');

const normalizeSortableValue = (value: string | number): string | number => {
  if (typeof value === 'number') {
    return value;
  }

  if (/^\d{4}[-.]\d{2}[-.]\d{2}$/.test(value as string)) {
    return parseInt(value.replace(/[.-]/g, ''), 10);
  }

  return parseFloat(value.replace(/\s/g, ''));
};

class ExpensesTableData implements DataTableData {
  private sortingKey: string;
  private sortingDirection: string;

  private header: Array<DataTableRecordCollection>;
  private body: Array<DataTableRecordCollection>;
  private footer: Array<DataTableRecordCollection>;

  constructor(expenses: Array<Expense>) {
    this.sortingKey = 'date';
    this.sortingDirection = 'asc';
    this.body = this.createBody(expenses);

    this.sort(this.sortingKey);

    this.header = this.createHeader();
    this.footer = this.createFooter(expenses);
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
      new ExpensesTableHeaderRecord(
        'name',
        i18n.expensesTable.expenseLabel,
        () => this.sort('name')
      ),
      new ExpensesTableHeaderRecord('tags', i18n.expensesTable.tagsLabel, () =>
        this.sort('tags')
      ),
      new ExpensesTableHeaderRecord('cost', i18n.expensesTable.costLabel, () =>
        this.sort('cost')
      ),
      new ExpensesTableHeaderRecord('date', i18n.expensesTable.dateLabel, () =>
        this.sort('date')
      ),
    ];

    return [new ExpensesTableRecordCollection('header', records)];
  }

  private createBody(
    expenses: Array<Expense>
  ): Array<DataTableRecordCollection> {
    return _.map(
      expenses,
      (expense: Expense): DataTableRecordCollection => {
        const onClick = (id: number, value: string | number) =>
          console.log(id, value);

        return new ExpensesTableRecordCollection(expense.getId(), [
          new ExpensesTableNameRecord(expense.getName(), onClick),
          new ExpensesTableTagsRecord(expense.getTags()),
          new ExpensesTableCostRecord(
            formatNumber(expense.getCost() / 100),
            onClick
          ),
          new ExpensesTableDateRecord(expense.getDate(), onClick),
        ]);
      }
    );
  }

  private createFooter(
    expenses: Array<Expense>
  ): Array<DataTableRecordCollection> {
    const records: Array<DataTableRecord> = [
      new ExpensesTableFooterRecord('name', i18n.expensesTable.totalLabel),
      new ExpensesTableFooterRecord('tags', ''),
      new ExpensesTableFooterRecord(
        'cost',
        formatNumber(
          _.reduce(
            expenses,
            (result: number, expense: Expense): number =>
              result + expense.getCost(),
            0
          ) / 100
        )
      ),
      new ExpensesTableFooterRecord('date', ''),
    ];

    return [new ExpensesTableRecordCollection('header', records)];
  }

  private sort(key: string) {
    if (key === this.sortingKey) {
      this.sortingDirection = this.sortingDirection === 'asc' ? 'desc' : 'asc';
    }

    this.sortingKey = key;

    const sorted = _.sortBy(this.body, [
      (row: DataTableRecordCollection) => {
        const result = _.chain(row.getRecords())
          .find(
            (record: DataTableRecord) => record.getName() === this.sortingKey
          )
          .value();

        const numericValue = normalizeSortableValue(result.getValue());

        return isNaN(numericValue as number) ? result.getValue() : numericValue;
      },
    ]);

    this.body = this.sortingDirection === 'asc' ? sorted : sorted.reverse();
  }
}

export { ExpensesTableData };
