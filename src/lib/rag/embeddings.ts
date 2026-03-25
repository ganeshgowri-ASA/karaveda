// TODO: Embedding pipeline for tax documents
// Will generate embeddings for scraped content and store in Qdrant

export async function generateEmbedding(text: string) {
  // TODO: Generate embedding using OpenAI API (OPENAI_API_KEY)
  throw new Error("Not implemented")
}

export async function indexDocument(content: string, metadata: Record<string, unknown>) {
  // TODO: Generate embedding and store in Qdrant with metadata
  throw new Error("Not implemented")
}
