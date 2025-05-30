export function getDateMonth(month: number): string {
    switch (month) {
        case 0: return "JAN";
        case 1: return "FEB";
        case 2: return "MAR";
        case 3: return "APR";
        case 4: return "MAY";
        case 5: return "JUN";
        case 6: return "JUL";
        case 7: return "AUG";
        case 8: return "SEP";
        case 9: return "OCT";
        case 10: return "NOV";
        case 11: return "DEC";
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

export function getDateKey(date: Date): string {
    return date.toISOString().split("T")[0];
}
