import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CA_SYSTEM_PROMPT } from "@/lib/prompts/ca-persona";
import { generateEmbedding } from "@/lib/rag/embeddings";
import { searchSimilar } from "@/lib/rag/qdrant-client";

const anthropic = new Anthropic();

async function getRAGContext(query: string): Promise<string> {
  try {
    if (!process.env.QDRANT_URL || !process.env.OPENAI_API_KEY) {
      return "";
    }

    const queryVector = await generateEmbedding(query);
    const results = await searchSimilar(queryVector, 5);

    if (results.length === 0) return "";

    const contextParts = results
      .filter((r) => r.score > 0.7)
      .map((r, i) => {
        const p = r.payload;
        return `[Source ${i + 1}] ${p.title} (${p.type} - ${p.act}, ${p.section}, dated ${p.effective_date})\nURL: ${p.source_url}\n${p.content}`;
      });

    if (contextParts.length === 0) return "";

    return `\n\n## Retrieved Context from Government Sources\n\nThe following relevant documents were retrieved from official government portals. Use them to provide accurate, up-to-date responses with proper citations:\n\n${contextParts.join("\n\n---\n\n")}`;
  } catch {
    // RAG is best-effort; don't block chat if it fails
    return "";
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages } = (await request.json()) as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "messages array is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Get the latest user message for RAG retrieval
  const latestUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");
  const ragContext = latestUserMessage
    ? await getRAGContext(latestUserMessage.content)
    : "";

  const systemPrompt = ragContext
    ? `${CA_SYSTEM_PROMPT}${ragContext}`
    : CA_SYSTEM_PROMPT;

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      stream.on("text", (text) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "text", text })}\n\n`)
        );
      });

      stream.on("error", (error) => {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
          )
        );
        controller.close();
      });

      stream.on("end", () => {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      });
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
