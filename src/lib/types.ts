export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type TaxQueryType = "GST" | "IT" | "TDS" | "General";

export interface TaxQuery {
  queryType: TaxQueryType;
  question: string;
  context?: string;
}
