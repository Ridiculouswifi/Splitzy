export class Currency {
    private name: string;
    private abbreviation: string;

    public constructor(name: string, abbreviation: string) {
        this.name = name;
        this.abbreviation = abbreviation;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getAbbreviation(): string {
        return this.abbreviation;
    }

    public setAbbreviation(abbreviation: string): void {
        this.abbreviation = abbreviation;
    }
}