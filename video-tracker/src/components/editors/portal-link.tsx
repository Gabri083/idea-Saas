"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { regenerateEditorToken } from "@/lib/actions/editors";

export function PortalLink({
  editorId,
  accessToken,
  showRegenerate = false,
}: {
  editorId: string;
  accessToken: string;
  showRegenerate?: boolean;
}) {
  const [token, setToken] = useState(accessToken);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCopy() {
    try {
      const url = `${window.location.origin}/e/${token}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar el link");
    }
  }

  function handleRegenerate() {
    if (
      !window.confirm(
        "El link que ya compartiste dejará de funcionar. ¿Generar uno nuevo?"
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const newToken = await regenerateEditorToken(editorId);
        setToken(newToken);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        className="px-2 py-1 text-xs"
        onClick={handleCopy}
      >
        {copied ? "¡Copiado!" : "Copiar link del editor"}
      </Button>
      {showRegenerate && (
        <Button
          type="button"
          variant="ghost"
          className="px-2 py-1 text-xs"
          onClick={handleRegenerate}
          disabled={isPending}
        >
          {isPending ? "Generando..." : "Generar nuevo link"}
        </Button>
      )}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
