import Deserializable from './Deserializable';
import Serializable from './Serializable';

class ExpenseCategory implements Deserializable, Serializable {
    private id:string;
    private name:string;

    constructor(id:string, name:string) {
        this.id = id;
        this.name = name;
    }

    public getName() {
        return this.name;
    }

    public getId() {
        return this.id;
    }

    public fromAsset(asset:any):ExpenseCategory {
        return new ExpenseCategory(asset.id, asset.name);
    }

    public toAsset():any {
        return {
            id: this.id,
            name: this.name
        }
    }
};

export default ExpenseCategory;
