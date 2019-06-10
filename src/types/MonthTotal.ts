import i18n from "utils/i18n";
import Deserializable from "./Deserializable";
import { extractMonthName, formatNumber } from "utils/stringUtils";

const _ = require("lodash");

class MonthTotal implements Deserializable {
    private month: string;
    private total: Number;

    constructor(month:string, total:Number) {
        this.checkIfMonthIsValid(month);
        this.checkIfTotalIsValid(total);

        this.month = month;
        this.total = total;
    }

    public getMonth(): string {
        return this.month;
    }

    public getMonthName(): string {
        return extractMonthName(this.month);
    }

    public getFormattedTotal(decimalPoints: number = 2): string {
        return formatNumber(this.getTotal(), decimalPoints);
    }

    public getTotal() : number {
        return _.get(this, "total", 0);
    }

    public fromAsset(asset: any) {
        return new MonthTotal(asset.month, asset.total);
    }

    private checkIfMonthIsValid(month: string) {
        if (!/^\d{4}-(1[0-2]|0[1-9])$/.test(month)) {
            throw new Error("You must provide valid month string (YYYY-MM)");
        }
    }

    private checkIfTotalIsValid(total: Number) {
        if (total < 0) {
            throw new Error("Total must be equal or greater than zero.");
        }
    }
}

export default MonthTotal
