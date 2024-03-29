import config from 'config.json';
import ExpenseCategory from 'types/ExpenseCategory';
import Expense, { ExpenseDto } from 'types/Expense';
import ExpenseTag from 'types/ExpenseTag';

const _ = require('lodash');
const axios = require('axios');

const backendUrl = (config as any).backendUrl;
const categoriesUrl: string = `${backendUrl}/categories`;

export const retrieveCategories: Function = async (): Promise<
  Array<ExpenseCategory>
> => {
  let response: any = await axios.get(categoriesUrl);

  return _.map(response.data, ExpenseCategory.prototype.fromAsset);
};

export const retrieveMonths: Function = async (): Promise<Array<string>> => {
  let response: any = await axios.get(`${backendUrl}/months`);

  return response.data;
};

export const retrieveExpenses: Function = async (
  latestMonth: string,
  numberOfMonths: number
): Promise<Array<Expense>> => {
  let response: any = await axios.get(
    `${backendUrl}/expenses/${latestMonth}/${numberOfMonths}`
  );

  return _.map(response.data, Expense.prototype.fromAsset);
};

export const filterExpenses: Function = async (
  expenseName: string
): Promise<any> => {
  const response: any = await axios.get(`${backendUrl}/filter/${expenseName}`);

  return Object.keys(response.data).reduce(
    (accumulator: any, month: string): any => {
      const expenses = response.data[month].map((asset: any) => {
        return Expense.prototype.fromAsset(asset);
      });

      return { ...accumulator, [month]: expenses };
    },
    {}
  );
};

export const retrieveSimilarExpenseNames: Function = async (
  expenseName: string
): Promise<Array<string>> => {
  let response: any = await axios.get(
    `${backendUrl}/expense-names/${_.trim(expenseName)}`
  );

  return response.data as Array<string>;
};

export const persistCategory: Function = async (
  categoryName: string
): Promise<ExpenseCategory> => {
  let response: any = await axios.post(categoriesUrl, { name: categoryName });

  return _.map(response.data, ExpenseCategory.prototype.fromAsset);
};

export const persistExpense: Function = async (
  expense: Expense
): Promise<Expense> => {
  let response = await axios.post(`${backendUrl}/expense`, expense.toAsset());

  return Expense.prototype.fromAsset(response.data);
};

export const updateExpense: Function = async (
  expenseId: number,
  changes: Partial<ExpenseDto>
): Promise<Expense> => {
  let response = await axios.patch(
    `${backendUrl}/expense/${expenseId}`,
    changes
  );

  return Expense.prototype.fromAsset(response.data);
};

export const retrieveCommonExpenseCost: Function = async (
  expenseName: string
): Promise<number> => {
  let response = await axios.get(`${backendUrl}/cost/${expenseName}`);

  return response.data;
};

export const retrieveTags: Function = async (): Promise<Array<ExpenseTag>> => {
  let response = await axios.get(`${backendUrl}/tags`);

  return response.data.map((tag: any) => new ExpenseTag(tag.id, tag.name));
};
