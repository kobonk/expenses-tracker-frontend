import Deserializable from './Deserializable';
import ExpenseCategory from './ExpenseCategory';
import MonthTotal from "./MonthTotal";

export default class ExpenseCategorySummary implements Deserializable {
    private category : ExpenseCategory
    private months : Array<MonthTotal>

    constructor(category : ExpenseCategory, months : Array<MonthTotal>) {
        this.category = category;
        this.months = months;
    }

    public getCategory() : ExpenseCategory {
        return this.category;
    }

    public getCategoryName() : string {
        return this.category.getName();
    }

    public getMonths() : Array<MonthTotal> {
        return this.months;
    }

    public getTotal() : number {
        return this.getMonths()
            .reduce((sum : number, month : MonthTotal) : number => sum + month.getTotal(), 0);
    }

    public getAverage() : number {
        return this.getTotal() / this.getMonths().length;
    }

    public fromAsset(asset: any): ExpenseCategorySummary {
        return new ExpenseCategorySummary(
            ExpenseCategory.prototype.fromAsset(asset.category),
            asset.months.map(MonthTotal.prototype.fromAsset)
        );
    }
};
