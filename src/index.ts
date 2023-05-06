import Vue from 'vue';

import {
  retrieveCategories,
  retrieveExpenses,
  retrieveMonths,
  updateExpense,
} from 'utils/restClient';

import './styles.sass';
import { extractMonthName } from 'utils/stringUtils';
import i18n from 'utils/i18n';
import Expense, { ExpenseAsset } from 'types/Expense';
import ExpenseCategory from 'types/ExpenseCategory';
import FilteredExpenses from './components/FilteredExpenses';
import ViewTitle from './components/ViewTitle';
import MonthFilterForm from './components/MonthFilterForm';
import { assetToDto } from 'utils/assetToDto';

const moment = require('moment');

const getMonths: Function = (
  startingMonth: string,
  numberOfMonths: number
): Array<string> => {
  const start = moment(startingMonth);

  return Array.from(Array(numberOfMonths).keys()).map(
    (monthDifference: number) => {
      return start
        .clone()
        .subtract(monthDifference, 'months')
        .format('YYYY-MM');
    }
  );
};

const STARTING_MONTH = moment().format('YYYY-MM');
const NUMBER_OF_VISIBLE_MONTHS = 6;

const vm = new Vue({
  components: {
    'add-expense-form': () =>
      import('./components/add-expense-form/add-expense-form'),
    'expense-category-month-view': () =>
      import('./components/ExpenseCategoryMonthView'),
    'expense-category-table-view': () =>
      import('./components/ExpenseCategoryTableView'),
    'find-expenses-form': () => import('./components/FindExpensesForm'),
    'filtered-expenses': FilteredExpenses,
    'month-filter-form': MonthFilterForm,
    'view-title': ViewTitle,
  },
  computed: {
    currentCategoryName(): string {
      return this.currentCategory ? this.currentCategory.getName() : '';
    },
    currentMonthName(): string {
      return this.currentMonth ? extractMonthName(this.currentMonth) : '';
    },
    monthNames(): Array<string> {
      return getMonths(this.startingMonth, this.numberOfVisibleMonths);
    },
    currentTitle(): string {
      switch (this.activeView) {
        case 'filtered-expenses':
          return i18n.findExpensesForm.resultTitle.replace(
            '{FILTER_TEXT}',
            this.filterText
          );
        case 'category-month':
          return `${this.currentMonthName} | ${this.currentCategoryName}`;
        default:
          return '';
      }
    },
    numberOfVisibleMonths(): number {
      return this.visibleMonths.length;
    },
    selectedMonths(): Array<string> {
      let monthCount = 0;

      return this.availableMonths.reverse().filter((month: string) => {
        if (
          month === this.startingMonth ||
          (monthCount >= 1 && monthCount < this.numberOfVisibleMonths)
        ) {
          monthCount += 1;
          return true;
        }

        return false;
      });
    },
    startingMonth(): string {
      return this.visibleMonths[0];
    },
  },
  data: {
    activeView: 'months',
    availableMonths: [],
    categories: [],
    categoryGridSortedColumn: 0,
    categoryGridSortingDirection: 'asc',
    currentCategory: null,
    currentMonth: null,
    expenses: [],
    filteredExpensesMap: null,
    filterText: '',
    visibleMonths: getMonths(STARTING_MONTH, NUMBER_OF_VISIBLE_MONTHS),
  },
  el: '#expenses-tracker',
  methods: {
    changeCategoryGridSorting(columnIndex: number, direction: string) {
      if (columnIndex === this.categoryGridSortedColumn && !direction) {
        this.categoryGridSortingDirection =
          this.categoryGridSortingDirection === 'asc' ? 'desc' : 'asc';
      }

      if (direction) {
        this.categoryGridSortingDirection = direction;
      }

      this.categoryGridSortedColumn = columnIndex;
    },
    displayFoundExpenses(name: string) {
      this.filterText = name;
      this.activeView = 'filtered-expenses';
    },
    onCategoryMonthSelected(data: any) {
      if (!data.category || !data.month) return;

      this.currentCategory = data.category;
      this.currentMonth = data.month;
      this.activeView = 'category-month';
    },
    onMonthRangeChanged(months: Array<string>) {
      this.visibleMonths = months;
      this.refreshMainView();
    },
    refreshMainView() {
      retrieveMonths()
        .then((months: Array<string>) => {
          this.availableMonths = months.includes(this.startingMonth)
            ? months
            : [...months, this.startingMonth];

          return retrieveCategories();
        })
        .then((categories: Array<ExpenseCategory>) => {
          this.categories = categories;

          return retrieveExpenses(
            this.startingMonth,
            this.numberOfVisibleMonths
          );
        })
        .then((expenses: Array<Expense>) => {
          this.expenses = expenses;
        });
    },
    showMonthsView() {
      this.activeView = 'months';
    },
    updateExpense: async (expenseId: number, value: Partial<ExpenseAsset>) => {
      await updateExpense(expenseId, assetToDto(value));

      const expenseIndex = vm.expenses.findIndex((expense: Expense) => {
        return expense.getId() === expenseId;
      });

      const expense = Expense.prototype.fromAsset({
        ...vm.expenses[expenseIndex].toAsset(),
        ...value,
      });

      vm.expenses = [
        ...vm.expenses.slice(0, expenseIndex),
        expense,
        ...vm.expenses.slice(expenseIndex + 1),
      ];
    },
  },
  mounted() {
    this.refreshMainView();
  },
});
