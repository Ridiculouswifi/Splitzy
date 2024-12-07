class Trip {
    private people: Person[];
    private tripName: string;
    private location: string;
    private startDate: Date;
    private endDate: Date;

    public constructor(tripName: string, location: string, start: Date, end: Date) {
        this.tripName = tripName;
        this.location = location;
        this.startDate = start;
        this.endDate = end;
        this.people = [new Person('', 1)];
    }
}