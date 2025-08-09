import {
	CapacitorSQLite,
	SQLiteConnection,
	SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import initSqlJs from "sql.js";
import { Buffer } from "buffer";
import { Capacitor } from "@capacitor/core";
import { ungzip } from "pako";

let sqlite: SQLiteConnection;
let db: SQLiteDBConnection;

export async function downloadMBTiles(url: string): Promise<Uint8Array> {
	return fetch(url)
		.then((res) => res.arrayBuffer())
		.then((ab) => new Uint8Array(ab));
}

export async function copyMBTiles(data: Uint8Array) {
	if (!db) {
		await initDB();
	}
	const SQL = await initSqlJs();
	const mdb = new SQL.Database(data);
	const res = mdb.exec("SELECT * FROM tiles");
	//// const chunkSize = 10; // Adjust chunk size as needed
	//// const values = res[0].values;
	//// for (let i = 0; i < values.length; i += chunkSize) {
	//// 	const chunk = values.slice(i, i + chunkSize);
	//// 	const statements = chunk.map(row => {
	//// 		const [z, x, y, data] = row;
	//// 		return {
	//// 			statement: `INSERT OR REPLACE INTO tiles (z, x, y, data) VALUES (?, ?, ?, ?)`,
	//// 			values: [z, x, y, Buffer.from(data as Uint8Array)]
	//// 		};
	//// 	});
	//// 	await db.executeSet(statements);
	//// 	console.log(`Inserted chunk ${i / chunkSize + 1} of ${Math.ceil(values.length / chunkSize)}: z=${chunk[0][0]}, x=${chunk[0][1]}, y=${chunk[0][2]}`);
	//// }
	const total = res[0].values.length;
	for (const [idx, row] of res[0].values.entries()) {
		const [z, x, y, data] = row;
		await db.run(
			`INSERT OR REPLACE INTO tiles (z, x, y, data) VALUES (?, ?, ?, ?)`,
			[
				z,
				x,
				y,
				Buffer.from(data as Uint8Array), // Convert Uint8Array to Buffer
			],
		);
		console.log(
			`Inserted tile z=${z}, x=${x}, y=${y}. Item ${idx + 1} of ${total}`,
		);
	}
	console.log(`Copied ${res[0].values.length} tiles from MBTiles data`);
}

export async function test(url: string) {
	const res = await downloadMBTiles(url);
	console.log("Downloaded MBTiles data");
	await copyMBTiles(res);
}

export async function initDB() {
	if (!Capacitor.isNativePlatform()) {
		throw new Error("initDB is only available on native platforms");
	}
	console.log("Initializing SQLite database for tiles");
	sqlite = new SQLiteConnection(CapacitorSQLite);
	db = await sqlite.createConnection("tiles", false, "no-encryption", 1, false);
	await db.open();
	await db.execute(`CREATE TABLE IF NOT EXISTS tiles (
		z INTEGER NOT NULL,
		x INTEGER NOT NULL,
		y INTEGER NOT NULL,
		data BLOB NOT NULL,
		PRIMARY KEY (z, x, y)
	)`);
	await db.execute(
		`CREATE INDEX IF NOT EXISTS idx_tiles_zxy ON tiles (z, x, y)`,
	);
}

async function deleteDB() {
	if (!Capacitor.isNativePlatform()) {
		throw new Error("deleteDB is only available on native platforms");
	}
	await db.execute(`DROP TABLE IF EXISTS tiles`);
	await initDB();
}

// @ts-expect-error aaaaa
window.deleteDB = deleteDB;

// @ts-expect-error aaaaa
window.initDB = initDB;

export async function getTile(
	z: number,
	x: number,
	y: number,
	signal?: AbortSignal
): Promise<Uint8Array | null> {
	if (signal?.aborted) {
		throw new DOMException("Aborted", "AbortError");
	}
	const abortPromise = new Promise<never>((_, reject) => {
		if (signal) {
			signal.addEventListener("abort", () => {
				reject(new DOMException("Aborted", "AbortError"));
			}, { once: true });
		}
	});
	const queryPromise = db.query(
		`SELECT data FROM tiles WHERE z = ? AND x = ? AND y = ?`,
		[z, x, y],
	);
	const res = await Promise.race([queryPromise, abortPromise]);
	if (!res.values || res.values.length === 0) {
		return null;
	}
	console.log(res);
	return await decompressGzip(res.values[0].data as Uint8Array);
}

// @ts-expect-error aaaaa
window.getTile = getTile;

async function decompressGzip(blob: Uint8Array): Promise<Uint8Array> {
	// const ds = new DecompressionStream("gzip");
	// const decompressedStream = new Blob([blob]).stream().pipeThrough(ds);
	// return new Uint8Array(await new Response(decompressedStream).arrayBuffer());
	return ungzip(blob);
}

export async function protocol(params: {
	url: string;
}, { signal }: AbortController): Promise<{ data: Uint8Array }> {
	console.log("Protocol called with params:", params);
	const url = new URL(params.url);
	const pathname = url.pathname.replace(/^\//, ""); // Remove leading slash
	const z = parseInt(pathname.split("/")[0]);
	const x = parseInt(pathname.split("/")[1]);
	const y = parseInt(pathname.split("/")[2]);
	if (!Capacitor.isNativePlatform()) {
		const t = await fetch(
			`https://tiles.openfreemap.org/planet/20250528_001001_pt/${z}/${x}/${y}.pbf`,
			{ signal }
		);
		if (t.status == 200) {
			const buffer = await t.arrayBuffer();
			return { data: new Uint8Array(buffer) };
		} else {
			throw new Error(`Tile fetch error: ${t.statusText}`);
		}
	}
	if (!db) {
		await initDB();
	}
	const tmsY = (1 << z) - 1 - y; // Invert y for TMS
	console.log(`Fetching tile: z=${z}, x=${x}, y=${y}, tmsY=${tmsY}`);
	const data = await getTile(z, x, tmsY, signal);
	if (!data) {
		console.warn(`Tile not found: z=${z}, x=${x}, y=${y}`);
		return {
			data: new Uint8Array(), // Return empty array if tile not found
		};
	}
	// return { data: await fetch("/0.pbf").then(res => res.arrayBuffer()).then(ab => new Uint8Array(ab)) };
	return { data };
}
