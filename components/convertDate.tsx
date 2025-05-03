export function getDateMonth(date: string): string {
    const result = date.split("/", 3);
    switch (result[1]) {
        case "1": return "JAN";
        case "2": return "FEB";
        case "3": return "MAR";
        case "4": return "APR";
        case "5": return "MAY";
        case "6": return "JUN";
        case "7": return "JUL";
        case "8": return "AUG";
        case "9": return "SEP";
        case "10": return "OCT";
        case "11": return "NOV";
        case "12": return "DEC";
        default: return "";
    } 
}

export function getDateDay(date: string): string {
    const result = date.split("/", 3);
    if (result[0].length == 1) {
        return "0" + result[0];
    }
    return result[0];
}

export function getDateYear(date: string): string {
    const result = date.split("/", 3);
    return result[2];
}
