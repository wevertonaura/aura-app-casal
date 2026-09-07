import { Landmark } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export function EmptyDebtsState() {
  return (
    <div className="card-glass flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-lilac/10 text-lilac">
        <Landmark className="h-6 w-6" />
      </span>
      <h3 className="font-display text-base font-semibold text-text">Nenhuma dívida cadastrada</h3>
      <p className="mx-auto mt-1.5 max-w-xs text-sm text-text-muted">
        Cadastre suas dívidas para começar a acompanhar seu plano de quitação.
      </p>
      <LinkButton href="#nova-divida" size="sm" className="mt-5">
        Adicionar primeira dívida
      </LinkButton>
    </div>
  );
}
