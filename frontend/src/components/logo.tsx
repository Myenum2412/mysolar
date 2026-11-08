import Link from "next/link";
import { SunIcon } from "lucide-react";

import { cn } from "cn";

export function Logo({
  href = "/",
  className,
  showText = true,
}: {
  href?: string;
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-medium", className)}
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <SunIcon className="size-4" />
      </span>
      {showText ? <span className="text-lg tracking-tight">MySolar</span> : null}
    </Link>
  );
}
