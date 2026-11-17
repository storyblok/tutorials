// Everything Debbie remembers, as JSON files in the private Vercel Blob store:

import type { AuditRecord, Dispute } from "./types.ts";

// All environments share one store, so every path starts with the environment
const ENV = process.env.VERCEL_ENV ?? "development";

async function readJson<T>(name: string): Promise<T | null> {
  const { get } = await import("@vercel/blob");
  const result = await get(`${ENV}/${name}`, {
    access: "private",
    useCache: false,
  });
  if (!result) {
    return null;
  }
  return (await new Response(result.stream).json()) as T;
}

async function writeJson(name: string, data: unknown): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(`${ENV}/${name}`, JSON.stringify(data), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// Each audit replaces the previous one.
export const loadLatestAudit = (spaceId: string) =>
  readJson<AuditRecord>(`audits/${spaceId}.json`);

export const saveAudit = (record: AuditRecord) =>
  writeJson(`audits/${record.spaceId}.json`, record);

export async function loadDisputes(spaceId: string): Promise<Dispute[]> {
  return (await readJson<Dispute[]>(`disputes/${spaceId}.json`)) ?? [];
}

// Read, append, write back. Two disputes recorded at the same moment can
// overwrite each other, which we accept for brevity's sake.
export async function addDispute(
  spaceId: string,
  dispute: Dispute,
): Promise<void> {
  const disputes = [...(await loadDisputes(spaceId)), dispute];
  await writeJson(`disputes/${spaceId}.json`, disputes);
}
