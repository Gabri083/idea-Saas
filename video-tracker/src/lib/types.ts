export type VideoStatus =
  | "pendiente"
  | "en_edicion"
  | "en_revision"
  | "aprobado"
  | "publicado";

export type PaymentStatus = "no_pagado" | "pendiente" | "pagado";

export const VIDEO_STATUSES: { value: VideoStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_edicion", label: "En edición" },
  { value: "en_revision", label: "En revisión" },
  { value: "aprobado", label: "Aprobado" },
  { value: "publicado", label: "Publicado" },
];

export const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: "no_pagado", label: "No pagado" },
  { value: "pendiente", label: "Pendiente" },
  { value: "pagado", label: "Pagado" },
];

export type Editor = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rate_per_video: number;
  payment_method: string | null;
  active: boolean;
  notes: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  editor_id: string;
  amount: number;
  paid_at: string;
  method: string | null;
  notes: string | null;
  created_at: string;
};

export type Video = {
  id: string;
  reference: string;
  client_name: string | null;
  platform: string | null;
  status: VideoStatus;
  editor_id: string | null;
  price: number | null;
  video_url: string | null;
  due_date: string | null;
  delivered_at: string | null;
  approved_at: string | null;
  payment_status: PaymentStatus;
  payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoWithEditor = Video & {
  editor: Pick<Editor, "id" | "name" | "rate_per_video"> | null;
};
