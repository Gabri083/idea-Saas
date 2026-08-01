import { AnchorHTMLAttributes, ButtonHTMLAttributes, forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-cobalt text-white hover:bg-cobalt-dim shadow-[0_0_0_1px_rgba(79,124,255,0.4),0_8px_24px_-8px_rgba(79,124,255,0.5)]",
  secondary: "bg-surface-2 text-foreground hover:bg-surface-2/70 border border-border",
  ghost: "text-foreground hover:bg-surface-2",
  outline: "border border-border text-foreground hover:bg-surface-2",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-xl",
  lg: "text-base px-6 py-3.5 rounded-xl",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />
    );
  },
);
Button.displayName = "Button";

interface LinkButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    Pick<LinkProps, "href"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: LinkButtonProps) {
  return <Link href={href} className={buttonClasses(variant, size, className)} {...props} />;
}
