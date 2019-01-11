const convertDateToString:Function = function(date:Date):string {
    let dateParts:Array<string> = [
        date.getFullYear() + "",
        date.getMonth() + 1 + "",
        date.getDate() + ""
    ];

    return dateParts.map((part) => part.length < 2 ? "0" + part : part).join("-");
}

export { convertDateToString };
