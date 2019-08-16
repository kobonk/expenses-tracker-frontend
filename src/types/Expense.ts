import Deserializable from "./Deserializable";
import ExpenseCategory from "./ExpenseCategory";
import Serializable from "./Serializable";

class Expense implements Deserializable, Serializable {
    private category : ExpenseCategory
    private cost : number
    private date : string
    private id : string
    private name : string
    private tags : Array<string>

    constructor(id : string, name : string, category : ExpenseCategory, date : string, cost : number, tags : Array<string>) {
        this.category = category;
        this.cost = cost;
        this.date = date;
        this.id = id;
        this.name = name;
        this.tags = tags;
    }

    public getCategory() : ExpenseCategory {
        return this.category;
    }

    public getCost() : number {
        return this.cost;
    }

    public getDate() : string {
        return this.date;
    }

    public getMonth() : string {
        return this.date.slice(0, 7);
    }

    public getName() : string {
        return this.name;
    }

    public getId() : string {
        return this.id;
    }

    public getTags() : Array<string> {
        return this.tags;
    }

    public fromAsset(asset : any) : Expense {
        let category = ExpenseCategory.prototype.fromAsset(asset.category);

        return new Expense(asset.id, asset.name, category, (asset.purchase_date || asset.date), asset.cost, asset.tags);
    }

    public toAsset() : any {
        return {
            category: this.category.toAsset(),
            cost: this.cost,
            purchase_date: this.date,
            id: this.id,
            name: this.name,
            tags: this.tags
        }
    }
};

export default Expense;
