import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

export async function createTables(db: SQLiteDatabase) {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_name TEXT,
            location TEXT,
            start_date DATE,
            end_date DATE
        );
        
        CREATE TABLE IF NOT EXISTS people (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            weight DECIMAL(3,2),
            trip_id INTEGER REFERENCES trips(id)
        );
    `);
    console.log("Tables Created");
};

export async function addToTrips(db: SQLiteDatabase, 
    tripName: string, location: string, 
    startDate: Date, endDate: Date): Promise<void> {
        await db.runAsync(`
            INSERT INTO trips (trip_name, location, start_date, end_date)
            VAlUES(?, ?, ?, ?);
        `, tripName, location, startDate.toLocaleDateString(), endDate.toLocaleDateString())
        .then(console.log);
}
