import * as data from "config.json";
import ExpenseCategory from "types/ExpenseCategory";
import Expense from "types/Expense";
import MonthStatistics from "types/MonthStatistics";
import { AssertionError } from "assert";

const _ = require("lodash");
const axios = require("axios");

const backendUrl = (data as any).backendUrl;
const categoriesUrl:string = `${ backendUrl }/categories`;

const retrieveCategories:Function = async ():Promise<Array<ExpenseCategory>> => {
    let response:any = await axios.get(categoriesUrl);

    return _.map(response.data, ExpenseCategory.prototype.fromAsset);
};

const retrieveMonthStatistics:Function = async (numberOfMonths:Number):Promise<Array<MonthStatistics>> => {
    let response:any = await axios.get(`${ backendUrl }/statistics/${ numberOfMonths }`);

    return _.chain(response.data)
    .groupBy((row:any) => row.category.id)
    .toArray()
    .map((assetGroup:Array<any>) => {
        return _.reduce(
            assetGroup,
            (result:any, asset:any) => {
                return {
                    category: asset.category,
                    months: _.concat(result.months, { month: asset.month, total: asset.total })
                }
            },
            { category: null, months: [] }
        )
    })
    .map(MonthStatistics.prototype.fromAsset)
    .value()
}

const persistCategory:Function = async (category:ExpenseCategory):Promise<ExpenseCategory> => {
    let response:any = await axios.post(categoriesUrl, category.toAsset());

    return _.map(response.data, ExpenseCategory.prototype.fromAsset);
};

const persistExpense:Function = async (expense:Expense):Promise<Expense> => {
    let response = await axios.post(`${ backendUrl }/expense`, expense.toAsset());

    return Expense.prototype.fromAsset(response.data);
}

export { persistCategory, persistExpense, retrieveCategories, retrieveMonthStatistics };
