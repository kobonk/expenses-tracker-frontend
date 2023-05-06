import Deserializable from './Deserializable';
import Serializable from './Serializable';

export default class ExpenseTag
  implements Deserializable, Serializable<ExpenseTagAsset> {
  private id: number;
  private name: string;

  constructor(id: number, name: string) {
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

  public toAsset(): ExpenseTagAsset {
    return {
      id: this.id,
      name: this.name,
    };
  }
}

export interface ExpenseTagAsset {
  id: number;
  name: string;
}
