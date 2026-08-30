import { cn } from "@/lib/cn";

export function ChatBubble({
  direction,
  text,
  time,
}: {
  direction: "in" | "out";
  text: string;
  time?: string;
}) {
  const fromAura = direction === "out";
  return (
    <div className={cn("flex", fromAura ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          fromAura
            ? "rounded-bl-sm border border-lilac/25 bg-lilac/10 text-text"
            : "rounded-br-sm bg-gradient-to-br from-lilac to-marsala text-white"
        )}
      >
        <p>{text}</p>
        {time && (
          <p className={cn("mt-1 text-[10px]", fromAura ? "text-text-faint" : "text-white/70")}>{time}</p>
        )}
      </div>
    </div>
  );
}
