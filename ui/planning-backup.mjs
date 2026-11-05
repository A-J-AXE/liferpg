// One pre-upgrade snapshot per browser profile. Nothing modifies the source workspace.
export async function backupLegacy(raw) {
  if (!raw) return;
  const contents = JSON.parse(raw);
  if (!contents.tasks?.length && !contents.projects?.length) return;
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open("lifeos-recovery", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("snapshots");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("snapshots", "readwrite");
      const store = tx.objectStore("snapshots"),
        req = store.getKey("before-periods");
      req.onsuccess = () => {
        if (req.result === undefined) store.add(raw, "before-periods");
      };
      tx.oncomplete = resolve;
      tx.onerror = tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
