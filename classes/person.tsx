class Person {
    private name: string;
    private weight: number;

    public constructor(name: string, weight: number) {
        this.name = name;
        this.weight = weight;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getWeight(): number {
        return this.weight;
    }

    public setWeight(weight: number): void {
        this.weight = weight;
    }
}
