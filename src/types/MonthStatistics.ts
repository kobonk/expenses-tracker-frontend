import Deserializable from './Deserializable';
import ExpenseCategory from './ExpenseCategory';
import MonthTotal from "./MonthTotal";

const _ = require("lodash");

class MonthStatistics implements Deserializable {
    private category: ExpenseCategory;
    private months: Array<MonthTotal>

    constructor(category: ExpenseCategory, months: Array<MonthTotal>) {
        this.category = category;
        this.months = months;
    }

    public getCategory(): ExpenseCategory {
        return this.category;
    }

    public getCategoryName(): string {
        return this.category.getName();
    }

    public getMonths(): Array<MonthTotal> {
        return this.months;
    }

    public fromAsset(asset: any): MonthStatistics {
        return new MonthStatistics(
            ExpenseCategory.prototype.fromAsset(asset.category),
            _.map(asset.months, MonthTotal.prototype.fromAsset)
        );
    }
}

export default MonthStatistics
