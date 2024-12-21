class Expense {
    private name: string;
    private payerId: number;
    private payerName: string;
    private amount: number;
    private currencyId: number;
    private abbreviation: string;
    private date: Date;
    private isResolved: string;

    public constructor(name: string, payerId: number, payerName: string, amount: number, 
            currencyId: number, abbreviation: string, date: Date, isResolved: string) {
        this.name = name;
        this.payerId = payerId;
        this.payerName = payerName;
        this.amount = amount;
        this.currencyId = currencyId;
        this.abbreviation = abbreviation;
        this.date = date;
        this.isResolved = isResolved;
    }

};
