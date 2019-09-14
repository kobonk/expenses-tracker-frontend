import Deserializable from "./Deserializable";
import Serializable from "./Serializable";

export default class ExpenseTag implements Deserializable, Serializable {
    private id: string
    private name: string

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public getId(): string {
        return this.id;
    }

    public fromAsset(asset: any): ExpenseTag {
        return new ExpenseTag(asset.id, asset.name);
    }

    public toAsset() : any {
        return {
            id: this.id,
            name: this.name
        }
    }
};
