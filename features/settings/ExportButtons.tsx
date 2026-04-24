"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startOfMonth, endOfMonth, format } from "date-fns";

export function ExportButtons() {
  const [from, setFrom] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  function openExport(kind: "csv" | "pdf") {
    const params = new URLSearchParams();
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(`${to}T23:59:59`).toISOString());
    window.open(`/api/export/${kind}?${params.toString()}`, "_blank");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Экспорт</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>С</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>По</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => openExport("csv")}>
            <FileSpreadsheet className="h-4 w-4" /> Скачать CSV
          </Button>
          <Button variant="outline" onClick={() => openExport("pdf")}>
            <FileText className="h-4 w-4" /> Скачать PDF
          </Button>
          <Button variant="ghost" onClick={() => window.open("/api/export/csv", "_blank")}>
            <Download className="h-4 w-4" /> Всё — CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
