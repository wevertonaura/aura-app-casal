import type { ReactNode } from "react";

export function PhoneMockup({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-lilac/25 via-transparent to-marsala/25 blur-3xl" />
      <div className="rounded-[2.5rem] border border-border-strong bg-bg-elevated p-2.5 shadow-2xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-surface">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-text/10" />
          <div className="flex items-center gap-2 border-b border-border px-4 pb-3 pt-8">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-lilac to-marsala text-xs font-semibold text-white">
              A
            </span>
            <div>
              <p className="text-xs font-medium text-text">Aura</p>
              <p className="text-[10px] text-text-faint">online</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
