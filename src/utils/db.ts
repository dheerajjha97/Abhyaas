/**
 * IndexedDB Cache for Abhyaas Question Papers
 * Provides offline caching for solved papers and search indices
 */

import { Paper } from '../types/question';

const DB_NAME = 'abhyaas_db';
const DB_VERSION = 1;
const STORE_PAPERS = 'cached_papers';
const STORE_METADATA = 'papers_metadata';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PAPERS)) {
        db.createObjectStore(STORE_PAPERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
      }
    };
  });
}

export async function savePaperToCache(paper: Paper): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_PAPERS, STORE_METADATA], 'readwrite');
    const store = tx.objectStore(STORE_PAPERS);
    const metaStore = tx.objectStore(STORE_METADATA);

    store.put(paper);
    metaStore.put({
      key: `updated_${paper.id}`,
      timestamp: Date.now()
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB write error:', err);
  }
}

export async function getPaperFromCache(paperId: string): Promise<Paper | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PAPERS, 'readonly');
    const store = tx.objectStore(STORE_PAPERS);
    const request = store.get(paperId);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('IndexedDB read error:', err);
    return null;
  }
}

export async function getAllCachedPapers(): Promise<Paper[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PAPERS, 'readonly');
    const store = tx.objectStore(STORE_PAPERS);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('IndexedDB get all error:', err);
    return [];
  }
}

export async function clearPapersCache(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_PAPERS, STORE_METADATA], 'readwrite');
    tx.objectStore(STORE_PAPERS).clear();
    tx.objectStore(STORE_METADATA).clear();
  } catch (err) {
    console.warn('IndexedDB clear error:', err);
  }
}
