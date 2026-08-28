"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Check, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 1 * 1024 * 1024;

export function LogoUploader({
  initialLogoUrl,
  canCustomize,
  dict,
}: {
  initialLogoUrl: string | null;
  canCustomize: boolean;
  dict: Dictionary["dashboard"]["widget"];
}) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_SIZE) {
      setError(dict.logoTooBigError);
      setStatus("error");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(dict.logoBadTypeError);
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/business/logo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || dict.logoUploadError);
      setLogoUrl(data.logo_url);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.logoUploadError);
      setStatus("error");
    }
  }

  return (
    <Card className="p-5">
      <p className="text-sm font-medium">{dict.logoTitle}</p>
      <p className="mt-1 text-xs text-muted">{dict.logoSubtitle}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
          {logoUrl ? (
            <Image src={logoUrl} alt="" width={56} height={56} className="h-full w-full object-contain" unoptimized />
          ) : (
            <ImagePlus size={20} className="text-muted" />
          )}
        </div>
        <label
          className={
            "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-surface-2" +
            (!canCustomize || status === "uploading" ? " pointer-events-none opacity-50" : "")
          }
        >
          {status === "uploading" ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {status === "uploading" ? dict.logoUploading : dict.logoUploadButton}
          <input
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            className="hidden"
            disabled={!canCustomize}
            onChange={handleFileChange}
          />
        </label>
        {status === "idle" && logoUrl && <Check size={16} className="text-emerald" />}
      </div>
      {status === "error" && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-rose">
          <AlertTriangle size={13} /> {error}
        </p>
      )}
    </Card>
  );
}
