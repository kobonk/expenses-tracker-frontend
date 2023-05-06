import { ExpenseAsset, ExpenseDto } from 'types/Expense';

const fieldNameMap: Partial<{ [K in keyof ExpenseAsset]: string }> = {
  id: 'expense_id',
  date: 'purchase_date'
}

export function assetToDto(asset: Partial<ExpenseAsset>): Partial<ExpenseDto> {
  return Object.keys(asset).reduce((accelerator: Partial<ExpenseDto>, key: keyof ExpenseAsset) => {
    const dtoKey = fieldNameMap[key] ?? key;

    return { ...accelerator, [dtoKey]: asset[key] };
  }, {});
}
