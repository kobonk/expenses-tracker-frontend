import * as data from "config.json";
import ExpenseCategory from "types/ExpenseCategory";
import Expense from "types/Expense";
import MonthStatistics from "types/MonthStatistics";

const _ = require("lodash");
const axios = require("axios");

const backendUrl = (data as any).backendUrl;
const categoriesUrl:string = `${ backendUrl }/categories`;

const retrieveCategories:Function = async ():Promise<Array<ExpenseCategory>> => {
    let response:any = await axios.get(categoriesUrl);

    return _.map(response.data, ExpenseCategory.prototype.fromAsset);
};

const retrieveExpenses: Function = async (categoryId: string, month: string): Promise<Array<Expense>> => {
    let response: any = await axios.get(`${ backendUrl }/expenses/${ categoryId }/${ month }`);

    return _.map(response.data, Expense.prototype.fromAsset);
};

const filterExpenses: Function = async (expenseName: string): Promise<any> => {
    const response: any = await axios.get(`${ backendUrl }/filter/${ expenseName }`);

    return Object.keys(response.data).reduce(
        (accumulator : any, month : string) : any => {
            const expenses = response.data[month].map((asset : any) => {
                return Expense.prototype.fromAsset(asset);
            });

            return { ...accumulator, [month]: expenses };
        },
        {}
    );
};

const retrieveMonthStatistics : Function = async (startingMonth : string, numberOfMonths : number) : Promise<Array<MonthStatistics>> => {
    let response : any = await axios.get(`${ backendUrl }/statistics/${ startingMonth }/${ numberOfMonths }`);

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
};

const retrieveSimilarExpenseNames: Function = async (expenseName: string): Promise<Array<string>> => {
    let response: any = await axios.get(`${ backendUrl }/expense-names/${ _.trim(expenseName) }`);

    return response.data as Array<string>;
};

const persistCategory: Function = async (categoryName: string):Promise<ExpenseCategory> => {
    let response:any = await axios.post(categoriesUrl, { name: categoryName });

    return _.map(response.data, ExpenseCategory.prototype.fromAsset);
};

const persistExpense:Function = async (expense:Expense):Promise<Expense> => {
    let response = await axios.post(`${ backendUrl }/expense`, expense.toAsset());

    return Expense.prototype.fromAsset(response.data);
}

const updateExpense: Function = async (expenseId: string, changes: Object) => {
    let response = await axios.patch(`${ backendUrl }/expense/${ expenseId }`, changes);

    return Expense.prototype.fromAsset(response.data);
}

export {
    persistCategory,
    persistExpense,
    retrieveCategories,
    retrieveExpenses,
    filterExpenses,
    retrieveMonthStatistics,
    retrieveSimilarExpenseNames,
    updateExpense
};
