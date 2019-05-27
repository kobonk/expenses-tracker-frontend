import Deserializable from "./Deserializable";

class ExpenseSummary implements Deserializable {
    private cost :number;
    private month :string;
    private name :string;

    constructor(name: string, month: string, cost: number) {
        this.cost = cost;
        this.month = month;
        this.name = name;
    }

    public getCost(): number {
        return this.cost;
    }

    public getMonth(): string {
        return this.month;
    }

    public getName(): string {
        return this.name;
    }

    public fromAsset(asset: any): ExpenseSummary {
        return new ExpenseSummary(asset.name, asset.month, asset.cost);
    }
};

export default ExpenseSummary;
