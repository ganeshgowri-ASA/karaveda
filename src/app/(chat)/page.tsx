"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Square, Loader2, Scale, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat-message";
import { useChat } from "@/hooks/use-chat";

const WELCOME_SUGGESTIONS = [
  "Compare old vs new tax regime for FY 2025-26",
  "What is the ITC reversal rule under Section 17(5)?",
  "What are the TDS rates for professional services?",
  "Explain the GST reverse charge mechanism",
];

export default function ChatPage() {
  const { messages, isLoading, error, sendMessage, stopGeneration, resetChat } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestion = (query: string) => {
    sendMessage(query);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-6">
                <Scale className="h-8 w-8 text-amber-700 dark:text-amber-300" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Welcome to KaraVeda
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-2">
                Your AI-powered Chartered Accountant assistant for Indian taxation.
                Ask about GST, Income Tax, TDS, and more.
              </p>
              <p className="text-xs text-muted-foreground italic mb-8">
                &ldquo;kara&rdquo; (tax) + &ldquo;veda&rdquo; (knowledge) — Ancient wisdom, modern tax guidance
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {WELCOME_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestion(suggestion)}
                    className="rounded-xl border bg-card p-3 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Error display */}
      {error && (
        <div className="mx-auto max-w-3xl w-full px-4">
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t bg-background p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about GST, Income Tax, TDS..."
            className="min-h-[44px] max-h-[160px] resize-none rounded-xl"
            rows={1}
            disabled={isLoading}
          />
          {isLoading ? (
            <Button
              size="icon"
              variant="destructive"
              onClick={stopGeneration}
              className="shrink-0 rounded-xl h-[44px] w-[44px]"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="shrink-0 rounded-xl h-[44px] w-[44px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          KaraVeda provides AI-assisted tax guidance. Always verify with a qualified CA.
        </p>
      </div>
    </div>
  );
}
