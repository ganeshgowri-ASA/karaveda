"use client";

import { MessageSquarePlus, Receipt, IndianRupee, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TaxQueryType } from "@/lib/types";

interface QueryTemplate {
  category: TaxQueryType;
  question: string;
}

const QUERY_TEMPLATES: QueryTemplate[] = [
  { category: "GST", question: "What is the ITC reversal rule under Section 17(5)?" },
  { category: "GST", question: "What are the GSTR-3B hard-lock changes?" },
  { category: "GST", question: "Explain GST on reverse charge mechanism for FY 2025-26" },
  { category: "IT", question: "Compare old vs new tax regime for FY 2025-26" },
  { category: "IT", question: "What are the Section 80C deduction limits?" },
  { category: "IT", question: "How is capital gains tax calculated on equity shares?" },
  { category: "TDS", question: "What are the TDS rates for professional services u/s 194J?" },
  { category: "TDS", question: "When is TDS on rent applicable under Section 194-IB?" },
  { category: "General", question: "What is the due date for filing GSTR-9 annual return?" },
  { category: "General", question: "Explain the difference between CGST, SGST, and IGST" },
];

const CATEGORY_CONFIG: Record<TaxQueryType, { icon: React.ReactNode; color: string }> = {
  GST: { icon: <Receipt className="h-3 w-3" />, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  IT: { icon: <IndianRupee className="h-3 w-3" />, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  TDS: { icon: <FileText className="h-3 w-3" />, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  General: { icon: <HelpCircle className="h-3 w-3" />, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

interface SidebarProps {
  onSelectQuery: (query: string) => void;
  onNewChat: () => void;
}

export function Sidebar({ onSelectQuery, onNewChat }: SidebarProps) {
  const categories = ["GST", "IT", "TDS", "General"] as TaxQueryType[];

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <Separator />

      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Queries
        </p>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-4 pb-4">
          {categories.map((category) => {
            const config = CATEGORY_CONFIG[category];
            const templates = QUERY_TEMPLATES.filter((t) => t.category === category);

            return (
              <div key={category} className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1">
                  <Badge variant="secondary" className={`text-[10px] gap-1 ${config.color}`}>
                    {config.icon}
                    {category === "IT" ? "Income Tax" : category}
                  </Badge>
                </div>
                {templates.map((template) => (
                  <button
                    key={template.question}
                    onClick={() => onSelectQuery(template.question)}
                    className="w-full text-left rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors line-clamp-2"
                  >
                    {template.question}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
