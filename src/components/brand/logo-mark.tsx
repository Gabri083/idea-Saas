import Image from "next/image";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo-mark.png"
      alt="Kelsira"
      width={size}
      height={size}
      className="rounded-lg"
      priority
    />
  );
}
