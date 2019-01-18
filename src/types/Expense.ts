import Deserializable from "./Deserializable";
import ExpenseCategory from "./ExpenseCategory";
import Serializable from "./Serializable";

class Expense implements Deserializable, Serializable {
    private category :ExpenseCategory;
    private cost :number;
    private date :string;
    private id :string;
    private name :string;

    constructor(id: string, name: string, category: ExpenseCategory, date: string, cost: number) {
        this.category = category;
        this.cost = cost;
        this.date = date;
        this.id = id;
        this.name = name;
    }

    public getCategory(): ExpenseCategory {
        return this.category;
    }

    public getCost(): number {
        return this.cost;
    }

    public getDate(): string {
        return this.date;
    }

    public getName(): string {
        return this.name;
    }

    public getId(): string {
        return this.id;
    }

    public fromAsset(asset: any): Expense {
        let category = ExpenseCategory.prototype.fromAsset(asset.category);

        return new Expense(asset.id, asset.name, category, asset.date, asset.cost);
    }

    public toAsset(): any {
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
