import { normalizePhoneBR } from "@/lib/phone";

/**
 * Cliente de WhatsApp via UAZAPI (https://docs.uazapi.com).
 *
 * Sem UAZAPI_BASE_URL/UAZAPI_INSTANCE_TOKEN configurados, cai no modo mock
 * de sempre — só loga no console e fica registrado em `WhatsappMessage`,
 * então nada quebra em dev sem credenciais.
 */
export interface WhatsappClient {
  sendMessage(to: string, text: string): Promise<void>;
}

export const whatsappClient: WhatsappClient = {
  async sendMessage(to, text) {
    const baseUrl = process.env.UAZAPI_BASE_URL;
    const token = process.env.UAZAPI_INSTANCE_TOKEN;

    if (!baseUrl || !token) {
      console.log(`[aura:whatsapp:mock] -> ${to}: ${text}`);
      return;
    }

    const res = await fetch(`${baseUrl}/send/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token },
      body: JSON.stringify({ number: normalizePhoneBR(to), text }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[aura:whatsapp:uazapi] falha ao enviar pra ${to} — ${res.status}: ${body}`);
    }
  },
};
