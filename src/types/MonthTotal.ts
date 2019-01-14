import i18n from "utils/i18n";
import Deserializable from './Deserializable';

class MonthTotal implements Deserializable {
    private month:string;
    private total:Number;

    constructor(month:string, total:Number) {
        this.checkIfMonthIsValid(month);
        this.checkIfTotalIsValid(total);

        this.month = month;
        this.total = total;
    }

    public getMonthName():string {
        let [year, month] = this.month.split("-");

        return `${ i18n.monthNames[parseInt(month) - 1] } ${ year }`;
    }

    public fromAsset(asset:any) {
        return new MonthTotal(asset.month, asset.total);
    }

    private checkIfMonthIsValid(month:string) {
        if (!/^\d{4}-(1[0-2]|0[1-9])$/.test(month)) {
            throw new Error("You must provide valid month string (YYYY-MM)");
        }
    }

    private checkIfTotalIsValid(total:Number) {
        if (total < 0) {
            throw new Error("Total must be equal or greater than zero.");
        }
    }
}

export default MonthTotal
