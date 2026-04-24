"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { TransactionDto } from "./schema";
import { CategoryIcon, CategoryBadge } from "./CategoryBadge";
import { formatMoney, type Currency } from "@/lib/money";
import { formatTime } from "@/lib/date";
import { cn } from "@/lib/utils";

export function TransactionRow({ tx, onEdit }: { tx: TransactionDto; onEdit: (tx: TransactionDto) => void }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/transactions/${tx.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Удалено");
      router.refresh();
    } else {
      toast.error("Не получилось удалить");
    }
    setDeleting(false);
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -80, right: 0 }}
      dragElastic={0.2}
      className="relative group touch-pan-y"
    >
      <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(tx)}
          aria-label="Редактировать"
          className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          aria-label="Удалить"
          disabled={deleting}
          className="grid h-8 w-8 place-items-center rounded-md text-danger hover:bg-danger-soft disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-3 px-1 py-3 bg-surface">
        <CategoryIcon category={tx.category} className="h-10 w-10 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium truncate">{tx.description}</p>
            {tx.aiConfidence !== null && tx.aiConfidence < 0.5 && (
              <span className="text-xs text-warning">AI: низкая уверенность</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <CategoryBadge category={tx.category} size="sm" withIcon={false} />
            <span className="text-xs text-muted-foreground tabular">{formatTime(new Date(tx.occurredAt))}</span>
          </div>
        </div>
        <span
          className={cn(
            "money text-sm font-medium shrink-0",
            tx.type === "INCOME" ? "text-success" : "text-foreground"
          )}
        >
          {tx.type === "INCOME" ? "+" : "−"}
          {formatMoney(tx.amount, tx.currency as Currency)}
        </span>
      </div>
    </motion.div>
  );
}
