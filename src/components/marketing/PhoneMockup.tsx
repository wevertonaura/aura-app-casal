import type { ReactNode } from "react";

export function PhoneMockup({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-lilac/30 via-transparent to-marsala/30 blur-3xl" />
      <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0a12] p-2.5 shadow-2xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0f0d16]">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/60" />
          <div className="flex items-center gap-2 border-b border-white/5 px-4 pb-3 pt-8">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-lilac to-marsala text-xs font-semibold text-white">
              A
            </span>
            <div>
              <p className="text-xs font-medium text-white">Aura</p>
              <p className="text-[10px] text-white/40">online</p>
            </div>
          </div>
          <div className="flex min-h-[380px] flex-col gap-2 px-3 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
