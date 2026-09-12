"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input, Select } from "@/components/ui/input";
import { PAYMENT_STATUSES, VIDEO_STATUSES, type Editor } from "@/lib/types";

export function VideosFilters({ editors }: { editors: Editor[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/dashboard/videos?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-48">
        <Select
          value={searchParams.get("editorId") ?? ""}
          onChange={(e) => updateParam("editorId", e.target.value)}
        >
          <option value="">Todos los editores</option>
          {editors.map((editor) => (
            <option key={editor.id} value={editor.id}>
              {editor.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-44">
        <Select
          value={searchParams.get("status") ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
        >
          <option value="">Todos los estados</option>
          {VIDEO_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-44">
        <Select
          value={searchParams.get("paymentStatus") ?? ""}
          onChange={(e) => updateParam("paymentStatus", e.target.value)}
        >
          <option value="">Todos los pagos</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-40">
        <Input
          type="month"
          value={searchParams.get("month") ?? ""}
          onChange={(e) => updateParam("month", e.target.value)}
        />
      </div>

      <div className="w-56">
        <Input
          placeholder="Buscar referencia o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParam("search", search);
          }}
          onBlur={() => updateParam("search", search)}
        />
      </div>
    </div>
  );
}
