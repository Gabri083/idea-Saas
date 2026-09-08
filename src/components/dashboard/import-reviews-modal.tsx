"use client";

import { useRef, useState } from "react";
import { X, Upload, Download, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Platform = "google" | "shopify" | "judgeme" | "loox" | "yotpo" | "trustpilot" | "okendo" | "stamped" | "other";
const PLATFORMS: Platform[] = ["google", "shopify", "judgeme", "loox", "yotpo", "trustpilot", "okendo", "stamped", "other"];
const MAX_ROWS_PER_REQUEST = 25;

type ParsedRow = { name: string; text: string; date?: string; rating?: number };
type Step = "platform" | "csv" | "result";

const TEMPLATE_HEADERS: Record<Locale, string[]> = {
  es: ["Fecha", "Cliente", "Reseña", "Puntaje"],
  en: ["Date", "Customer", "Review", "Rating"],
};

const HEADER_SYNONYMS: Record<"date" | "name" | "text" | "rating", string[]> = {
  date: ["fecha", "date"],
  name: ["cliente", "customer", "name", "nombre"],
  text: ["resena", "review", "texto", "text"],
  rating: ["puntaje", "rating", "calificacion", "score"],
};

function normalizeHeader(cell: string): string {
  return cell
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Minimal RFC4180-ish CSV parser — handles quoted fields with commas/newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function rowsFromCsv(text: string): ParsedRow[] {
  const table = parseCsv(text);
  if (table.length < 2) return [];

  const header = table[0].map(normalizeHeader);
  const indexOf = (key: keyof typeof HEADER_SYNONYMS) =>
    header.findIndex((h) => HEADER_SYNONYMS[key].includes(h));

  const nameIdx = indexOf("name");
  const textIdx = indexOf("text");
  const dateIdx = indexOf("date");
  const ratingIdx = indexOf("rating");
  if (nameIdx === -1 || textIdx === -1) return [];

  return table
    .slice(1)
    .filter((r) => r.some((cell) => cell.trim() !== ""))
    .map((r) => {
      const rating = ratingIdx >= 0 ? Number(r[ratingIdx]) : undefined;
      return {
        name: (r[nameIdx] ?? "").trim(),
        text: (r[textIdx] ?? "").trim(),
        date: dateIdx >= 0 ? r[dateIdx]?.trim() || undefined : undefined,
        rating: rating && !Number.isNaN(rating) ? rating : undefined,
      };
    })
    .filter((r) => r.name && r.text);
}

function downloadTemplate(locale: Locale) {
  const headers = TEMPLATE_HEADERS[locale];
  const csv = headers.join(",") + "\r\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kelsira-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function ImportReviewsModal({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary["dashboard"]["reviews"]["import"];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("platform");
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<{ imported: number; total: number; capReached: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("platform");
    setPlatform(null);
    setFileName(null);
    setRows([]);
    setFileError(null);
    setImporting(false);
    setProgress({ done: 0, total: 0 });
    setResult(null);
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function handleFile(file: File) {
    setFileError(null);
    setFileName(file.name);
    const text = await file.text();
    const parsed = rowsFromCsv(text);
    if (parsed.length === 0) {
      setFileError(dict.emptyFileError);
      setRows([]);
      return;
    }
    setRows(parsed);
  }

  async function startImport() {
    if (!platform || rows.length === 0) return;
    setImporting(true);
    setProgress({ done: 0, total: rows.length });

    let imported = 0;
    let capReached = false;
    for (let i = 0; i < rows.length; i += MAX_ROWS_PER_REQUEST) {
      const chunk = rows.slice(i, i + MAX_ROWS_PER_REQUEST);
      try {
        const res = await fetch("/api/reviews/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform, rows: chunk }),
        });
        const data = await res.json();
        imported += data.imported ?? 0;
        if (data.capReached) capReached = true;
      } catch {
        // keep going — chunk failed entirely, its rows just don't count
      }
      setProgress({ done: Math.min(i + MAX_ROWS_PER_REQUEST, rows.length), total: rows.length });
      if (capReached) break;
    }

    setResult({ imported, total: rows.length, capReached });
    setImporting(false);
    setStep("result");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <Upload size={14} /> {dict.button}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md bg-surface p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step === "csv" && (
                  <button onClick={() => setStep("platform")} className="text-muted hover:text-foreground" aria-label={dict.backButton}>
                    <ChevronLeft size={18} />
                  </button>
                )}
                <p className="text-sm font-medium">{dict.modalTitle}</p>
              </div>
              <button onClick={close} className="text-muted hover:text-foreground" aria-label={dict.close}>
                <X size={18} />
              </button>
            </div>

            {step === "platform" && (
              <div className="mt-4">
                <p className="text-xs text-muted">{dict.platformStepTitle}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPlatform(p);
                        setStep("csv");
                      }}
                      className="rounded-lg border border-border px-2 py-2.5 text-center text-xs text-foreground/85 transition-colors hover:bg-surface-2"
                    >
                      {dict.platforms[p]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "csv" && platform && (
              <div className="mt-4 flex flex-col gap-3">
                <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">{dict.platformTips[platform]}</p>
                <p className="text-xs text-muted">{dict.csvHint}</p>

                <button
                  onClick={() => downloadTemplate(locale)}
                  className="flex w-fit items-center gap-1.5 text-xs text-cobalt hover:underline"
                >
                  <Download size={13} /> {dict.downloadTemplate}
                </button>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-lg border border-dashed border-border px-3 py-3 text-center text-xs text-muted transition-colors hover:text-foreground"
                  >
                    {fileName ?? dict.chooseFile}
                  </button>
                </div>

                {fileError && <p className="text-xs text-rose">{fileError}</p>}
                {rows.length > 0 && !fileError && (
                  <p className="text-xs text-emerald">{dict.resultSummary.replace("{imported}", String(rows.length)).replace("{total}", String(rows.length))}</p>
                )}
                <p className="text-[11px] text-muted">{dict.maxRowsNote}</p>

                {importing ? (
                  <p className="text-center text-xs text-muted">
                    {dict.batchProgress.replace("{done}", String(progress.done)).replace("{total}", String(progress.total))}
                  </p>
                ) : (
                  <Button onClick={startImport} disabled={rows.length === 0} className="mt-1 w-full justify-center">
                    {dict.startImport}
                  </Button>
                )}
              </div>
            )}

            {step === "result" && result && (
              <div className="mt-4 flex flex-col gap-3">
                <p className={cn("text-sm", result.imported > 0 ? "text-emerald" : "text-muted")}>
                  {dict.resultSummary.replace("{imported}", String(result.imported)).replace("{total}", String(result.total))}
                </p>
                {result.capReached && <p className="text-xs text-amber">{dict.capReachedMidway}</p>}
                <Button onClick={close} className="mt-1 w-full justify-center">
                  {dict.done}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
