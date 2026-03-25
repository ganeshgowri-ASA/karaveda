import { randomUUID } from "crypto";
import { upsertPoints, type TaxDocumentPayload } from "./qdrant-client";

const EMBEDDING_MODEL = "text-embedding-3-small";
const MAX_CHUNK_TOKENS = 1000;
const OVERLAP_TOKENS = 200;
// Approximate: 1 token ~ 4 characters for English text
const CHARS_PER_TOKEN = 4;
const MAX_CHUNK_CHARS = MAX_CHUNK_TOKENS * CHARS_PER_TOKEN;
const OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN;

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI embedding API error: ${response.status} ${error}`);
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  return data.data[0].embedding;
}

export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  // OpenAI supports batch embeddings natively
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI embedding API error: ${response.status} ${error}`);
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[]; index: number }>;
  };

  // Sort by index to maintain order
  return data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

/**
 * Split content by legal document boundaries (Section, Rule, Circular headers)
 * then apply character-based chunking with overlap.
 */
export function chunkContent(content: string): string[] {
  // Split on common legal document section boundaries
  const sectionPattern =
    /\n(?=(?:Section|Rule|Circular|Notification|Article|Chapter|Part|Schedule)\s+\d)/gi;
  const sections = content.split(sectionPattern).filter((s) => s.trim());

  const chunks: string[] = [];

  for (const section of sections) {
    if (section.length <= MAX_CHUNK_CHARS) {
      chunks.push(section.trim());
    } else {
      // Further split large sections with overlap
      let start = 0;
      while (start < section.length) {
        const end = Math.min(start + MAX_CHUNK_CHARS, section.length);
        // Try to break at a sentence boundary
        let breakPoint = end;
        if (end < section.length) {
          const lastPeriod = section.lastIndexOf(".", end);
          const lastNewline = section.lastIndexOf("\n", end);
          const candidate = Math.max(lastPeriod, lastNewline);
          if (candidate > start + MAX_CHUNK_CHARS / 2) {
            breakPoint = candidate + 1;
          }
        }
        chunks.push(section.slice(start, breakPoint).trim());
        start = breakPoint - OVERLAP_CHARS;
        if (start < 0) start = 0;
        // Prevent infinite loop if overlap pushes start backwards
        if (start <= chunks.length > 1 ? breakPoint - MAX_CHUNK_CHARS : 0) {
          start = breakPoint;
        }
      }
    }
  }

  return chunks.filter((c) => c.length > 0);
}

export async function indexDocument(
  content: string,
  metadata: Omit<TaxDocumentPayload, "content">
): Promise<{ chunksIndexed: number }> {
  const chunks = chunkContent(content);

  if (chunks.length === 0) {
    return { chunksIndexed: 0 };
  }

  // Generate embeddings in batch
  const embeddings = await generateEmbeddingsBatch(chunks);

  // Create points with unique IDs
  const points = chunks.map((chunk, i) => ({
    id: randomUUID(),
    vector: embeddings[i],
    payload: {
      ...metadata,
      content: chunk,
    },
  }));

  // Upsert in batches of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    const batch = points.slice(i, i + BATCH_SIZE);
    await upsertPoints(batch);
  }

  return { chunksIndexed: chunks.length };
}
