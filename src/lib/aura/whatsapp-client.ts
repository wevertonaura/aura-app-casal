/**
 * Stub do cliente de WhatsApp. No MVP, apenas loga a mensagem de saída —
 * ela já fica registrada em `WhatsappMessage` e visível na tela Aura
 * WhatsApp do app, então nada se perde para quem está testando.
 *
 * Para plugar de verdade: implemente `sendMessage` chamando a WhatsApp
 * Business Cloud API (Meta) ou Twilio, usando as variáveis de ambiente
 * WHATSAPP_API_TOKEN / WHATSAPP_PHONE_NUMBER_ID. O resto do sistema (engine,
 * parser, banco) não precisa mudar.
 */
export interface WhatsappClient {
  sendMessage(to: string, text: string): Promise<void>;
}

export const whatsappClient: WhatsappClient = {
  async sendMessage(to, text) {
    if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      // TODO: integração real com a WhatsApp Business Cloud API.
      // await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, { ... })
    }
    console.log(`[aura:whatsapp:mock] -> ${to}: ${text}`);
  },
};
