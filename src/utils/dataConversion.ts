const _ = require("lodash");

const convertDateToString: Function = (date: Date): string => {
    let dateParts: Array<string> = [
        date.getFullYear() + "",
        date.getMonth() + 1 + "",
        date.getDate() + ""
    ];

    return dateParts.map((part) => part.length < 2 ? "0" + part : part).join("-");
};

const formatNumber: Function = (numericValue: number, decimalPlaces: number = 2): string => {
    let fixed = numericValue.toFixed(decimalPlaces);
    let integerPart = _.first(fixed.match(/^\d*/));
    let decimalPart = _.first(fixed.match(/\D.*$/));
    let digitChunks = _.reverse(_.map(_.chunk(_.reverse(integerPart.split("")), 3), _.reverse));
    let numericChunks = _.map(digitChunks, (chunk: Array<string>) => chunk.join(""));

    return _.join(numericChunks, " ") + decimalPart;
};

export { convertDateToString, formatNumber };
