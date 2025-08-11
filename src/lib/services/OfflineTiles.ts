import { appDataDir, join } from "@tauri-apps/api/path";
import { BaseDirectory, exists, mkdir, open, remove, SeekMode } from "@tauri-apps/plugin-fs";
import { download } from "@tauri-apps/plugin-upload";
import { PMTiles, TileType, type Source } from "pmtiles";

export async function downloadPMTiles(url: string, name: string, onprogress?: (progress: number, total: number) => any): Promise<void> {
//	if(!window.__TAURI__) {
//		throw new Error("Tauri environment is not available.");
//	}

	const filename = name + ".pmtiles";
	const baseDir = BaseDirectory.AppData;
	const appDataDirPath = await appDataDir();

	if(!await exists(appDataDirPath)) {
		await mkdir(appDataDirPath, { recursive: true });
	}

	if(await exists(filename, { baseDir })) {
		console.log(`File ${filename} already exists, deleting it.`);
		await remove(filename, { baseDir });
	}

	console.log(`Downloading PMTiles from ${url} to ${filename}`);
	const res = await fetch(url);

	if (!res.ok) {
		throw new Error(`Failed to download PMTiles: ${res.statusText}`);
	}

	const path = await join(appDataDirPath, filename);

  let totalProgress = 0;
	await download(url, path, ({ progress, total }) => {
    totalProgress += progress;
		console.log(`Download progress: ${Math.round((totalProgress / total) * 100)}% (${totalProgress}\tof ${total} bytes)`);
    if(onprogress) onprogress(totalProgress, total);
	});

	console.log(`Download completed: ${path}`);
}

export async function getRemoteList(): Promise<{ name: string, file: string }[]> {
	return await fetch("https://trafficcue-tiles.picoscratch.de/index.json").then(res => res.json());
}

export async function hasPMTiles(name: string): Promise<boolean> {
	if(!window.__TAURI__) {
		return false; // Tauri environment is not available
	}
	
	const filename = name + ".pmtiles";
	const baseDir = BaseDirectory.AppData;
	const appDataDirPath = await appDataDir();

	if(!await exists(appDataDirPath)) {
		return false;
	}

	const filePath = await join(appDataDirPath, filename);
	return await exists(filePath, { baseDir });
}

export async function getPMTilesURL(name: string) {
	if(!window.__TAURI__) {
		return `pmtiles://https://trafficcue-tiles.picoscratch.de/${name}.pmtiles`;
	}
	const filename = name + ".pmtiles";
	const baseDir = BaseDirectory.AppData;
	const appDataDirPath = await appDataDir();

	if(!await exists(appDataDirPath)) {
		return `pmtiles://https://trafficcue-tiles.picoscratch.de/${name}.pmtiles`;
		// throw new Error("App data directory does not exist.");
	}

	const filePath = await join(appDataDirPath, filename);

	if(!await exists(filePath, { baseDir })) {
		return `pmtiles://https://trafficcue-tiles.picoscratch.de/${name}.pmtiles`;
		// throw new Error(`PMTiles file not found: ${filePath}`);
	}

	return `tiles://${name}`;
}

async function readBytes(name: string, offset: number, length: number): Promise<Uint8Array> {
	const file = await open(name + ".pmtiles", { read: true, baseDir: BaseDirectory.AppData });
	const buffer = new Uint8Array(length);
	await file.seek(offset, SeekMode.Start);
	await file.read(buffer);
	await file.close();
	return buffer;
}

export class FSSource implements Source {
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	async getBytes(offset: number, length: number, _signal?: AbortSignal, _etag?: string) { // TODO: abort signal
		const data = await readBytes(this.name, offset, length);
		return {
			data: data.buffer as ArrayBuffer,
			etag: undefined,
			cacheControl: undefined,
			expires: undefined
		}
	}

	getKey = () => this.name;
}

interface RequestParameters {
  url: string;
  headers?: unknown;
  method?: "GET" | "POST" | "PUT";
  body?: string;
  type?: "string" | "json" | "arrayBuffer" | "image";
  credentials?: "same-origin" | "include";
  collectResourceTiming?: boolean;
};

export class Protocol {
  /** @hidden */
  tiles: Map<string, PMTiles>;
  metadata: boolean;  errorOnMissingTile: boolean;

  /**
   * Initialize the MapLibre PMTiles protocol.
   *
   * * metadata: also load the metadata section of the PMTiles. required for some "inspect" functionality
   * and to automatically populate the map attribution. Requires an extra HTTP request.
   * * errorOnMissingTile: When a vector MVT tile is missing from the archive, raise an error instead of
   * returning the empty array. Not recommended. This is only to reproduce the behavior of ZXY tile APIs
   * which some applications depend on when overzooming.
   */
  constructor(options?: { metadata?: boolean; errorOnMissingTile?: boolean }) {
    this.tiles = new Map<string, PMTiles>();
    this.metadata = options?.metadata || false;
    this.errorOnMissingTile = options?.errorOnMissingTile || false;
  }

  /**
   * Add a {@link PMTiles} instance to the global protocol instance.
   *
   * For remote fetch sources, references in MapLibre styles like pmtiles://http://...
   * will resolve to the same instance if the URLs match.
   */
  add(p: PMTiles) {
    this.tiles.set(p.source.getKey(), p);
  }

  /**
   * Fetch a {@link PMTiles} instance by URL, for remote PMTiles instances.
   */
  get(url: string) {
    return this.tiles.get(url);
  }

  /** @hidden */
  tilev4 = async (
    params: RequestParameters,
    abortController: AbortController
  ) => {
    if (params.type === "json") {
      const pmtilesUrl = params.url.substr(8);
      let instance = this.tiles.get(pmtilesUrl);
      if (!instance) {
        instance = new PMTiles(new FSSource(pmtilesUrl));
        this.tiles.set(pmtilesUrl, instance);
      }

      if (this.metadata) {
        return {
          data: await instance.getTileJson(params.url),
        };
      }

      const h = await instance.getHeader();

      if (h.minLon >= h.maxLon || h.minLat >= h.maxLat) {
        console.error(
          `Bounds of PMTiles archive ${h.minLon},${h.minLat},${h.maxLon},${h.maxLat} are not valid.`
        );
      }

      return {
        data: {
          tiles: [`${params.url}/{z}/{x}/{y}`],
          minzoom: h.minZoom,
          maxzoom: h.maxZoom,
          bounds: [h.minLon, h.minLat, h.maxLon, h.maxLat],
        },
      };
    }
    const re = new RegExp(/tiles:\/\/(.+)\/(\d+)\/(\d+)\/(\d+)/);
    const result = params.url.match(re);
    if (!result) {
      throw new Error("Invalid Tiles protocol URL");
    }
    const pmtilesUrl = result[1];

    let instance = this.tiles.get(pmtilesUrl);
    if (!instance) {
      instance = new PMTiles(new FSSource(pmtilesUrl));
      this.tiles.set(pmtilesUrl, instance);
    }
    const z = result[2];
    const x = result[3];
    const y = result[4];

    const header = await instance.getHeader();
    const resp = await instance?.getZxy(+z, +x, +y, abortController.signal);
    if (resp) {
      return {
        data: new Uint8Array(resp.data),
        cacheControl: resp.cacheControl,
        expires: resp.expires,
      };
    }
    if (header.tileType === TileType.Mvt) {
      if (this.errorOnMissingTile) {
        throw new Error("Tile not found.");
      }
      return { data: new Uint8Array() };
    }
    return { data: null };
  };
}

export const protocol = new Protocol({
	metadata: true,
	errorOnMissingTile: false,
}).tilev4;
