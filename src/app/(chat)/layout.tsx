"use client";

import { useState, useCallback } from "react";
import { Menu, Scale, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  // These will be passed to children via context or direct rendering
  // For now, the sidebar triggers are handled by dispatching custom events
  const handleSelectQuery = useCallback((query: string) => {
    setSidebarOpen(false);
    window.dispatchEvent(
      new CustomEvent("karaveda:query", { detail: query })
    );
  }, []);

  const handleNewChat = useCallback(() => {
    setSidebarOpen(false);
    window.dispatchEvent(new CustomEvent("karaveda:reset"));
  }, []);

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4 bg-background shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar trigger */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Sidebar
                onSelectQuery={handleSelectQuery}
                onNewChat={handleNewChat}
              />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-600" />
            <div>
              <h1 className="text-sm font-bold leading-none">KaraVeda</h1>
              <p className="text-[10px] text-muted-foreground">
                AI-Powered CA Assistant
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-72 border-r flex-col bg-muted/30">
          <Sidebar
            onSelectQuery={handleSelectQuery}
            onNewChat={handleNewChat}
          />
        </aside>

        {/* Chat area */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
