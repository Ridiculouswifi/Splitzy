export class Currency {
    private id: number
    private name: string;
    private abbreviation: string;

    public constructor(id: number, name: string, abbreviation: string) {
        this.id = id;
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

    public getId(): number {
        return this.id;
    }

    public setId(id: number): void {
        this.id = id;
    }
}
