// TODO: Qdrant vector database connection and operations
// Will store embeddings of scraped tax documents for RAG retrieval

export async function getQdrantClient() {
  // TODO: Initialize Qdrant client with env vars (QDRANT_URL, QDRANT_API_KEY)
  throw new Error("Not implemented")
}

export async function searchSimilar(query: string, limit = 5) {
  // TODO: Search for similar documents in Qdrant
  throw new Error("Not implemented")
}
