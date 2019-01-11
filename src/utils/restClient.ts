import { backendUrl } from 'config';
import axios from "axios";
import ExpenseCategory from 'types/ExpenseCategory';
import Expense from 'types/Expense';

const _ = require("lodash");

const categoriesUrl:string = `${ backendUrl }/categories`;

const retrieveCategories:Function = async ():Promise<Array<ExpenseCategory>> => {
    let response:any = await axios.get(categoriesUrl);

    return _.map(response.data, ExpenseCategory.prototype.fromAsset);
};

const persistCategory:Function = async (category:ExpenseCategory):Promise<ExpenseCategory> => {
    let response:any = await axios.post(categoriesUrl, category.toAsset());

    return _.map(response.data, ExpenseCategory.prototype.fromAsset);
};

const persistExpense:Function = async (expense:Expense):Promise<Expense> => {
    let response = await axios.post(`${ backendUrl }/expense`, expense.toAsset());

    return Expense.prototype.fromAsset(response.data);
}

export { persistCategory, persistExpense, retrieveCategories };
