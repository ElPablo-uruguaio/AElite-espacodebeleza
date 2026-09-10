/**
 * Utility to generate a valid PIX Copy and Paste string (EMV BR Code)
 * and SVG data for rendering the QR code without external heavy dependencies.
 */

export interface PixPayloadParams {
  chave: string;
  nomeRecebedor: string;
  cidade: string;
  valor: number;
  txid?: string;
}

export function generatePixPayload({
  chave,
  nomeRecebedor,
  cidade,
  valor,
  txid = 'BELEZA20'
}: PixPayloadParams): string {
  // Clean inputs
  const cleanChave = chave.replace(/[^a-zA-Z0-9@.-]/g, '');
  const cleanNome = nomeRecebedor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25).toUpperCase();
  const cleanCidade = cidade.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15).toUpperCase();
  const valorFormatted = valor.toFixed(2);

  // Helper for EMV TLV format (Type-Length-Value)
  const formatField = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  // Merchant Account Info
  const gui = formatField('00', 'br.gov.bcb.pix');
  const key = formatField('01', cleanChave);
  const merchantAccount = formatField('26', `${gui}${key}`);

  const category = formatField('52', '0000');
  const currency = formatField('53', '986'); // BRL
  const amount = formatField('54', valorFormatted);
  const country = formatField('58', 'BR');
  const name = formatField('59', cleanNome || 'ESPACO BELEZA VIP');
  const city = formatField('60', cleanCidade || 'SAO PAULO');
  const additional = formatField('62', formatField('05', txid || '***'));

  const rawPayload = `000201${merchantAccount}${category}${currency}${amount}${country}${name}${city}${additional}6304`;

  // CRC16 Calculation (CCITT-FALSE)
  let crc = 0xFFFF;
  for (let i = 0; i < rawPayload.length; i++) {
    crc ^= (rawPayload.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');

  return `${rawPayload}${crcHex}`;
}
