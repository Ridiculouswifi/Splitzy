import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { openDatabaseSync, SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

const database = openDatabaseSync("splitzy.db");

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
            weight INTEGER,
            trip_id INTEGER REFERENCES trips(id)
        );

        CREATE TABLE IF NOT EXISTS currencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            currency_name TEXT,
            abbreviation TEXT,
            trip_id INTEGER REFERENCES trips(id)
        );
    `);
    console.log("Tables Created");
};

/* Functions for trips table */
export async function addToTrips(db: SQLiteDatabase, 
    tripName: string, location: string, 
    startDate: Date, endDate: Date): Promise<void> {
        await db.runAsync(`
            INSERT INTO trips (trip_name, location, start_date, end_date)
            VAlUES(?, ?, ?, ?);
        `, tripName, location, startDate.toLocaleDateString(), endDate.toLocaleDateString())
        .then(console.log);
}

export async function deleteTrip(db: SQLiteDatabase, id: number): Promise<void> {
    await db.runAsync(`DELETE FROM trips WHERE id = ?;`, id);

    let tableName: string = "trip_" + id.toString();
    const data = await db.execAsync(`DROP TABLE ${tableName};`);

    console.log(data, "Deleted");
}

export async function getLatestTripId(db: SQLiteDatabase): Promise<unknown[]> {
    const data = await db.getAllAsync(`
        SELECT id FROM trips
        ORDER BY id DESC
        LIMIT 1    
    `)
    console.log(data);
    return data;
}

/* Functions for people table */
export async function addToPeople(db: SQLiteDatabase, name: string, 
    weight: number, tripId: number): Promise<void> {
        await db.runAsync(`
            INSERT INTO people (name, weight, trip_id)
            VALUES(?, ?, ?);    
        `, name, weight, tripId)
        .then(console.log);
}

export async function deletePerson(db: SQLiteDatabase, id: number): Promise<void> {
    await db.runAsync(`DELETE FROM people WHERE id = ?;`, id);
}

export async function deleteRelatedPeople(db: SQLiteDatabase, tripId: number): Promise<void> {
    await db.runAsync(`DELETE FROM people WHERE trip_id = ?`, tripId);
}

export async function getRelatedPeople(db: SQLiteDatabase, tripId: number) : Promise<unknown[]> {
    return await db.getAllAsync(`
        SELECT * FROM people
        WHERE trip_id = ?;    
    `, tripId);
}

/* Functions for currencies table */
export async function addToCurrencies(db: SQLiteDatabase, currencyName: string, 
    abbreviation: string, tripId: number): Promise<void> {
        await db.runAsync(`
            INSERT INTO currencies (currency_name, abbreviation, trip_id)
            VALUES(?, ?, ?)    
        `, currencyName, abbreviation, tripId)
        .then(console.log);
    }

export async function deleteCurrency(db: SQLiteDatabase, id: number): Promise<void> {
    await db.runAsync(`DELETE FROM people WHERE id = ?;`, id);
}

export async function deleteRelatedCurrencies(db: SQLiteDatabase, tripId: number): Promise<void> {
    await db.runAsync(`DELETE FROM currencies WHERE trip_id = ?`, tripId);
}

export async function getRelatedCurrencies(db: SQLiteDatabase, tripId: number): Promise<unknown[]> {
    return await db.getAllAsync(`
        SELECT * FROM currencies
        WHERE trip_id = ?;    
    `, tripId);
}

/* Functions to store expenses */
export async function createTrip(db: SQLiteDatabase, tripId: number) {
    let tableName: string = "trip_" + tripId.toString();
    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, ''); // Removes characters that can cause SQL injection

    const data = await db.execAsync(`
        PRAGMA journal_mode = WAL;
        
        CREATE TABLE IF NOT EXISTS ${sanitizedTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payer_id INTEGER REFERENCES people(id),
            expense FLOAT,
            currency_id INTEGER REFERENCES currencies(id)
        );
    `);
    
    console.log(data, "created");
}
