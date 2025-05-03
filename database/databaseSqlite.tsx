import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';

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

export async function getPerson(db: SQLiteDatabase, id: number): Promise<unknown[]> {
    return await db.getAllAsync(`
        SELECT * FROM people
        WHERE id = ?;    
    `, id);
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

export async function getCurrency(db: SQLiteDatabase, id: number): Promise<unknown[]> {
    return await db.getAllAsync(`
        SELECT * FROM currencies
        WHERE id = ?;
    `, id);
}

/* Functions to store expenses */
export async function createTrip(db: SQLiteDatabase, tripId: number) {
    let tableName: string = "trip_" + tripId.toString();
    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, ''); // Removes characters that can cause SQL injection

    const data = await db.execAsync(`
        PRAGMA journal_mode = WAL;
        
        CREATE TABLE IF NOT EXISTS ${sanitizedTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            payer_id INTEGER REFERENCES people(id),
            expense FLOAT,
            currency_id INTEGER REFERENCES currencies(id),
            date DATE,
            is_resolved TEXT
        );
    `);
    
    console.log(data, "Trip Table created for trip ", tripId);

    await createTransactionsTable(db, tripId);
}

interface PeopleTableTypes {
    id: number, 
    name: string, 
    weight: number, 
    trip_id: number
}
export async function addMembers(db: SQLiteDatabase, tripId: number) {
    const peopleData = await getRelatedPeople(db, tripId) as PeopleTableTypes[];
    console.log(peopleData);

    for (let i = 0; i < peopleData.length; i++) {
        await createMemberColumn(db, tripId, peopleData[i].id);
        console.log("added", peopleData[i].name);
    }
}

export async function createMemberColumn(db: SQLiteDatabase, tripId: number, personId: number) {
    let tableName: string = "trip_" + tripId.toString();
    let columnName: string = "person_" + personId.toString();

    const data = await db.execAsync(`
        ALTER TABLE ${tableName} ADD COLUMN ${columnName} FLOAT;
    `);
}

export async function deleteMemberColumn(db: SQLiteDatabase, tripId: number, personId: number) {
    let tableName: string = "trip_" + tripId.toString();
    let columnName: string = "person_" + personId.toString();
    console.log("For", tableName);

    const data = await db.execAsync(`
        ALTER TABLE ${tableName} DROP COLUMN ${columnName};
    `)

    console.log(data, "column deleted");
}

export async function addExpense(db: SQLiteDatabase, tripId: number,
    expenseName: string, payerId: number, amount: number, currencyId: number, date: Date,
    people: PeopleTableTypes[]) {
        let tableName: string = "trip_" + tripId.toString();
        await db.runAsync(`
            INSERT INTO ${tableName} (name, payer_id, expense, currency_id, date, is_resolved)
            VALUES(?, ?, ?, ?, ?, ?);
        `, expenseName, payerId, amount, currencyId, date.toLocaleDateString(), false);

        const expenseData =  await getLatestExpenseId(db, tableName) as {id: number}[];
        const expenseId = expenseData[0].id;

        for (let i = 0; i < people.length; i++) {
            let columnName: string = "person_" + people[i].id.toString();
            await db.runAsync(`
                UPDATE ${tableName}
                SET ${columnName} = ${people[i].weight}
                WHERE id = ${expenseId}
            `);
        }
        
        console.log("Expense added:", expenseId);
}

export async function deleteExpense(db: SQLiteDatabase, id: number, tripId: number) {
    let tableName: string = "trip_" + tripId.toString();
    
    await db.runAsync(`DELETE FROM ${tableName} WHERE id = ?;`, id);
}

export async function getLatestExpenseId(db: SQLiteDatabase, tableName: string) {
    const data = await db.getAllAsync(`
        SELECT id FROM ${tableName}
        ORDER BY id DESC
        LIMIT 1    
    `)
    console.log(data);
    return data;
}

export async function updateExpenseStatus(db: SQLiteDatabase, id: number, tripId: number, status: string) {
    let tableName: string = "trip_" + tripId.toString();

    await db.runAsync(`
        UPDATE ${tableName}
        SET is_resolved = ${status}
        WHERE id = ${id}
    `);
}

/* Functions to store transactions */
export async function createTransactionsTable(db: SQLiteDatabase, tripId: number) {
    let tableName: string = "transaction_" + tripId.toString();
    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, ''); // Removes characters that can cause SQL injection

    const data = await db.execAsync(`
        PRAGMA journal_mode = WAL;
        
        CREATE TABLE IF NOT EXISTS ${sanitizedTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payer_id INTEGER REFERENCES people(id),
            recipient_id INTEGER REFERENCES people(id),
            amount FLOAT,
            currency_id INTEGER REFERENCES currencies(id),
            date DATE
        );
    `);
    
    console.log(data, "Transactions Table created for trip ", tripId);
}

export async function addTransaction(db: SQLiteDatabase, tripId: number,
        payerId: number, recipientId: number, amount: number, currencyId: number, date: Date) {
    let tableName: string = "transaction_" + tripId.toString();
    await db.runAsync(`
        INSERT INTO ${tableName} (payer_id, recipient_id, amount, currency_id, date)
        VALUES(?, ?, ?, ?, ?);
    `,payerId, recipientId, amount, currencyId, date.toLocaleDateString());

    console.log("Transaction added for trip ", tripId);
}

export async function deleteTransaction(db: SQLiteDatabase, id: number, tripId: number) {
    let tableName: string = "transaction_" + tripId.toString();
    
    await db.runAsync(`DELETE FROM ${tableName} WHERE id = ?;`, id);
}
