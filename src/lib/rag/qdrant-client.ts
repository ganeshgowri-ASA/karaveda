import { QdrantClient } from "@qdrant/js-client-rest";

const COLLECTION_NAME = "tax_knowledge";
const VECTOR_SIZE = 1536; // OpenAI text-embedding-3-small dimensions

export interface TaxDocumentPayload {
  act: string;
  section: string;
  fy_year: string;
  effective_date: string;
  type: "circular" | "notification" | "act" | "rule" | "judgment";
  source_url: string;
  content: string;
  title: string;
}

let client: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (client) return client;

  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url) {
    throw new Error("QDRANT_URL environment variable is not set");
  }

  client = new QdrantClient({
    url,
    ...(apiKey ? { apiKey } : {}),
  });

  return client;
}

export async function ensureCollection(): Promise<void> {
  const qdrant = getQdrantClient();

  const collections = await qdrant.getCollections();
  const exists = collections.collections.some(
    (c) => c.name === COLLECTION_NAME
  );

  if (!exists) {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine",
      },
    });

    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: "type",
      field_schema: "keyword",
    });

    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: "act",
      field_schema: "keyword",
    });

    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: "fy_year",
      field_schema: "keyword",
    });
  }
}

export async function upsertPoints(
  points: Array<{
    id: string;
    vector: number[];
    payload: TaxDocumentPayload;
  }>
): Promise<void> {
  const qdrant = getQdrantClient();
  await ensureCollection();

  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points: points.map((p) => ({
      id: p.id,
      vector: p.vector,
      payload: p.payload as unknown as Record<string, unknown>,
    })),
  });
}

export async function searchSimilar(
  queryVector: number[],
  limit = 5,
  filter?: Record<string, unknown>
): Promise<
  Array<{
    id: string | number;
    score: number;
    payload: TaxDocumentPayload;
  }>
> {
  const qdrant = getQdrantClient();
  await ensureCollection();

  const results = await qdrant.search(COLLECTION_NAME, {
    vector: queryVector,
    limit,
    with_payload: true,
    ...(filter ? { filter } : {}),
  });

  return results.map((r) => ({
    id: r.id,
    score: r.score,
    payload: r.payload as unknown as TaxDocumentPayload,
  }));
}

export async function deletePoints(ids: string[]): Promise<void> {
  const qdrant = getQdrantClient();

  await qdrant.delete(COLLECTION_NAME, {
    wait: true,
    points: ids,
  });
}

export { COLLECTION_NAME };
