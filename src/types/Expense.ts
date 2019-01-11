import Deserializable from "./Deserializable";
import ExpenseCategory from "./ExpenseCategory";
import Serializable from "./Serializable";

class Expense implements Deserializable, Serializable {
    private category:ExpenseCategory;
    private cost:Number;
    private date:string;
    private id:string;
    private name:string;

    constructor(id:string, name:string, category:ExpenseCategory, date:string, cost:Number) {
        this.category = category;
        this.cost = cost;
        this.date = date;
        this.id = id;
        this.name = name;
    }

    public getName() {
        return this.name;
    }

    public getId() {
        return this.id;
    }

    public fromAsset(asset:any):Expense {
        let category = ExpenseCategory.prototype.fromAsset(asset.category);

        return new Expense(asset.id, asset.name, category, asset.purchase_date, asset.cost);
    }

    public toAsset():any {
        return {
            category: this.category.toAsset(),
            cost: this.cost,
            purchase_date: this.date,
            id: this.id,
            name: this.name
        }
    }
};

export default Expense;
