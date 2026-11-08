import { Logo } from "@/components/logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground md:text-left">
          © {new Date().getFullYear()} MySolar. All rights reserved.
        </p>
      </div>
      <div className="relative hidden bg-muted lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/login-cover.svg"
          alt="Solar panels under a setting sun"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
