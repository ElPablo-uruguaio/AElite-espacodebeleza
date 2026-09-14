/**
 * Helper to generate pre-formatted WhatsApp links with emojis for salon operations.
 */

export interface WhatsAppMessageParams {
  phone: string;
  clienteNome: string;
  servicoNome?: string;
  profissionalNome?: string;
  dataHoraStr?: string;
  nomeSalao?: string;
  googleReviewLink?: string;
}

export function formatPhoneForWhatsApp(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('55')) return clean;
  return `55${clean}`;
}

export function createWhatsAppReminderLink({
  phone,
  clienteNome,
  servicoNome = 'seu serviço',
  profissionalNome = 'nossa equipe',
  dataHoraStr = 'hoje',
  nomeSalao = 'Espaço Beleza VIP'
}: WhatsAppMessageParams): string {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const text = `Olá, *${clienteNome}*! ✨\n\nPassando para lembrar do seu agendamento no *${nomeSalao}*:\n\n📅 *Data/Horário:* ${dataHoraStr}\n💇‍♀️ *Serviço:* ${servicoNome}\n👤 *Profissional:* ${profissionalNome}\n\nTe aguardamos com muito carinho! Se precisar remarcar, nos avise por aqui. 💖`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function createWhatsAppConfirmationLink({
  phone,
  clienteNome,
  servicoNome = 'seu serviço',
  profissionalNome = 'nossa equipe',
  dataHoraStr = 'horário marcado',
  nomeSalao = 'Espaço Beleza VIP'
}: WhatsAppMessageParams): string {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const text = `Olá, *${clienteNome}*! 🎉\n\nSeu agendamento no *${nomeSalao}* foi *CONFIRMADO* com sucesso!\n\n📅 *Data/Horário:* ${dataHoraStr}\n💇‍♀️ *Serviço:* ${servicoNome}\n👤 *Profissional:* ${profissionalNome}\n\nSua vaga está garantida. Te aguardamos com muito carinho! ✨`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function createWhatsAppGoogleReviewLink({
  phone,
  clienteNome,
  nomeSalao = 'Espaço Beleza VIP',
  googleReviewLink = 'https://g.page/r/espacobelezavip/review'
}: WhatsAppMessageParams): string {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const text = `Olá, *${clienteNome}*! ❤️\n\nFoi um enorme prazer receber você hoje no *${nomeSalao}*!\n\nSua opinião é muito importante para nós. Poderia deixar uma avaliação de 5 estrelas no nosso Google Meu Negócio? Leva menos de 1 minuto! ⭐⭐⭐⭐⭐\n\nClique no link para avaliar:\n👉 ${googleReviewLink}\n\nMuito obrigada pela preferência e até a próxima! 💇‍♀️✨`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function createWhatsAppSurveyLink({
  phone,
  clienteNome,
  nomeSalao = 'Espaço Beleza VIP'
}: WhatsAppMessageParams): string {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const text = `Olá, *${clienteNome}*! 🥰\n\nComo foi sua experiência no *${nomeSalao}* hoje?\n\nQueremos saber o que você achou do atendimento e do resultado! Se tiver qualquer sugestão, responda esta mensagem. Adoramos ouvir você! 💬✨`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
