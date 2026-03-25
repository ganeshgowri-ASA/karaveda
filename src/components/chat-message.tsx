"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/types";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        <AvatarFallback
          className={cn(
            "text-xs font-semibold",
            isUser
              ? "bg-blue-600 text-white"
              : "bg-amber-600 text-white"
          )}
        >
          {isUser ? "You" : <Scale className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%] min-w-0",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-muted rounded-bl-md"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre({ children }) {
                    return (
                      <pre className="overflow-x-auto rounded-lg bg-black/10 dark:bg-white/10 p-3 text-xs">
                        {children}
                      </pre>
                    );
                  },
                  code({ children, className }) {
                    const isBlock = className?.startsWith("language-");
                    if (isBlock) {
                      return <code className={className}>{children}</code>;
                    }
                    return (
                      <code className="rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.5 text-xs">
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-2">
                        <table className="min-w-full text-xs border-collapse">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return (
                      <th className="border border-border px-2 py-1 bg-muted font-semibold text-left">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className="border border-border px-2 py-1">
                        {children}
                      </td>
                    );
                  },
                }}
              >
                {message.content || "Thinking..."}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-muted-foreground">{timestamp}</span>
          {!isUser && message.content && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
