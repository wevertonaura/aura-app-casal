/**
 * Normaliza um número de telefone brasileiro pro formato que o WhatsApp
 * (via UAZAPI) espera: só dígitos, sempre com DDI 55 na frente.
 *
 * A maioria das pessoas digita o número sem o "+55" (ex: "11 91234-5678"
 * em vez de "+55 11 91234-5678") — sem completar isso, o envio/recebimento
 * de mensagem falha (ou pior, falha em silêncio). DDD + telefone de 8 ou 9
 * dígitos = 10 ou 11 dígitos no total; nesse caso, assumimos Brasil.
 */
export function normalizePhoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}
