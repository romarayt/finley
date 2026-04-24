"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { FloatingAddButton } from "./FloatingAddButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QuickAddForm } from "@/features/transactions/QuickAddForm";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:pl-60 pb-24 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">{children}</div>
      </main>
      <BottomNav />
      <FloatingAddButton onClick={() => setOpen(true)} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Новая транзакция</DialogTitle>
            <DialogDescription>
              Опиши одной фразой — AI распарсит и предложит категорию.
            </DialogDescription>
          </DialogHeader>
          <QuickAddForm onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
