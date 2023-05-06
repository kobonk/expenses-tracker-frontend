import Deserializable from './Deserializable';
import ExpenseCategory, { ExpenseCategoryAsset } from './ExpenseCategory';
import ExpenseTag, { ExpenseTagAsset } from './ExpenseTag';
import Serializable from './Serializable';
import Transferable from './Transferable';

class Expense
  implements
    Deserializable,
    Serializable<ExpenseAsset>,
    Transferable<ExpenseDto> {
  private category: ExpenseCategory;
  private cost: number;
  private date: string;
  private id: number;
  private name: string;
  private tags: ExpenseTag[];

  constructor(
    id: number,
    name: string,
    category: ExpenseCategory,
    date: string,
    cost: number,
    tags: ExpenseTag[]
  ) {
    this.category = category;
    this.cost = cost;
    this.date = date;
    this.id = id;
    this.name = name;
    this.tags = tags;
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

  public getMonth(): string {
    return this.date.slice(0, 7);
  }

  public getName(): string {
    return this.name;
  }

  public getId(): number {
    return this.id;
  }

  public getTags(): ExpenseTag[] {
    return this.tags;
  }

  public fromAsset(asset: any): Expense {
    let category = ExpenseCategory.prototype.fromAsset(asset.category);
    let tags = asset.tags.map(ExpenseTag.prototype.fromAsset);

    return new Expense(
      asset.id,
      asset.name,
      category,
      asset.date,
      asset.cost,
      tags
    );
  }

  public toAsset(): ExpenseAsset {
    return {
      category: this.category.toAsset(),
      cost: this.cost,
      date: this.date,
      id: this.id,
      name: this.name,
      tags: this.tags.map((tag: ExpenseTag) => tag.toAsset()),
    };
  }

  public toDto(): ExpenseDto {
    return {
      expense_id: this.id,
      name: this.name,
      cost: this.cost,
      purchase_date: this.date,
      category_id: this.category.getId(),
    };
  }
}

export interface ExpenseDto {
  expense_id: number;
  name: string;
  cost: number;
  purchase_date: string;
  category_id: number;
  tags?: string[];
  shop_id?: string;
  amount?: number;
  amount_unit_id?: string;
}

export interface ExpenseAsset {
  category: ExpenseCategoryAsset;
  cost: number;
  date: string;
  id: number;
  name: string;
  tags: ExpenseTagAsset[];
}

export default Expense;
