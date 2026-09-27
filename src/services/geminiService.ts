import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const modelName = (import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash').trim();

/**
 * Analisa uma imagem para orientar recomendações personalizadas de visagismo.
 */
export const analisarVisagismo = async (base64: string, mimeType: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('A chave VITE_GEMINI_API_KEY não foi configurada.');
  }

  if (!base64 || !mimeType) {
    throw new Error('A imagem em base64 e o mimeType são obrigatórios.');
  }

  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
Você é um consultor especialista em visagismo do salão Elite Espaço de Beleza.
Analise a imagem enviada com cuidado e produza uma recomendação profissional, acolhedora e prática em português do Brasil.

Organize a resposta nestas seções:
1. Impressão geral do formato do rosto e das características visíveis relevantes.
2. Cortes recomendados, explicando o motivo e a manutenção necessária.
3. Cores e técnicas de coloração recomendadas, considerando harmonia e praticidade.
4. Tratamentos indicados para o estado aparente dos fios.
5. Cuidados e perguntas que o profissional deve confirmar antes de executar o serviço.

Não faça diagnósticos médicos, não presuma informações que não estejam visíveis e deixe claro que a recomendação final deve ser confirmada por um profissional presencialmente.
A análise deve ser específica para o atendimento no Elite Espaço de Beleza.
`.trim();

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    },
  ]);

  return result.response.text();
};
