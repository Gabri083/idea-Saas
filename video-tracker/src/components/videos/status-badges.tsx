import { Badge } from "@/components/ui/badge";
import {
  PAYMENT_BADGE_CLASSES,
  PAYMENT_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from "@/lib/utils";
import type { PaymentStatus, VideoStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: VideoStatus }) {
  return (
    <Badge className={STATUS_BADGE_CLASSES[status]}>{STATUS_LABELS[status]}</Badge>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge className={PAYMENT_BADGE_CLASSES[status]}>{PAYMENT_LABELS[status]}</Badge>
  );
}
