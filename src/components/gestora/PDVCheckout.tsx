import React, { useState } from 'react';
import { X, DollarSign, CreditCard, QrCode, Banknote, CheckCircle2, Sparkles, Receipt, Star, MessageSquare } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { Appointment } from '../../types';
import { createWhatsAppGoogleReviewLink } from '../../utils/whatsapp';

interface PDVCheckoutProps {
  appointment: Appointment;
  onClose: () => void;
}

export const PDVCheckout: React.FC<PDVCheckoutProps> = ({ appointment, onClose }) => {
  const { checkoutAppointment, services, employees, settings, servicoProdutos, estoque } = useSalon();
  const [paymentMethod, setPaymentMethod] = useState<'pos' | 'virtual' | 'pix' | 'dinheiro'>('pos');
  const [completed, setCompleted] = useState(false);

  const servico = services.find(s => s.id === appointment.servico_id);
  const profissional = employees.find(e => e.id === appointment.profissional_id);

  const valorTotal = appointment.valor_total;
  const valorSinal = appointment.valor_sinal || 20.00;
  const saldoAReceber = Math.max(0, valorTotal - valorSinal);

  // Stock items linked to this service
  const linkedItems = servicoProdutos
    .filter(sp => sp.servico_id === appointment.servico_id)
    .map(sp => {
      const prod = estoque.find(e => e.id === sp.produto_id);
      return { nome: prod?.nome_produto || 'Produto', qtd: sp.quantidade_consumida, unidade: prod?.unidade_medida || 'un' };
    });

  const handleFinalizeCheckout = () => {
    checkoutAppointment(appointment.id, paymentMethod);
    setCompleted(true);
  };

  const googleReviewWaUrl = createWhatsAppGoogleReviewLink({
    phone: appointment.cliente_phone,
    clienteNome: appointment.cliente_nome,
    nomeSalao: settings.nome_salao,
    googleReviewLink: settings.google_review_link || 'https://g.page/r/espacobelezavip/review'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Fechamento de Caixa (PDV)</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Cliente: <strong className="text-white">{appointment.cliente_nome}</strong> ({appointment.cliente_phone})
          </p>
        </div>

        {completed ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-6 rounded-2xl text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            
            <div>
              <h4 className="font-bold text-lg text-white">Caixa Encerrado com Sucesso!</h4>
              <p className="text-xs text-emerald-200/80 mt-1">
                Pagamento via <strong>{paymentMethod.toUpperCase()}</strong> registrado. Baixa no estoque efetuada e +1 Ponto de Fidelidade adicionado à cliente.
              </p>
            </div>

            {/* GOOGLE REVIEW INCENTIVE BUTTON */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2 text-left">
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Incentivo ao Google Meu Negócio:
              </p>
              <p className="text-[11px] text-zinc-400">
                Envie o agradecimento com o link de avaliação de 5 estrelas diretamente no WhatsApp da cliente.
              </p>
              <a
                href={googleReviewWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar Avaliação Google via WhatsApp</span>
              </a>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-3 rounded-xl transition"
            >
              Concluir & Voltar à Agenda
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Calculation Breakdown Box */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Serviço Realizado:</span>
                <span className="font-bold text-white">{servico?.nome}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Profissional Responsável:</span>
                <span className="font-bold text-rose-400">{profissional?.nome}</span>
              </div>

              {/* Linked Stock Insumos Preview */}
              {linkedItems.length > 0 && (
                <div className="text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 space-y-1">
                  <span className="font-bold block">Insumos que receberão baixa no estoque:</span>
                  <ul className="list-disc list-inside text-zinc-300 text-[10px]">
                    {linkedItems.map((item, idx) => (
                      <li key={idx}>{item.nome}: -{item.qtd} {item.unidade}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="border-t border-zinc-800 pt-3 flex justify-between text-sm">
                <span className="text-zinc-300">Valor Total do Serviço:</span>
                <span className="font-bold text-white">R$ {valorTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm text-emerald-400 font-semibold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 inline" /> Abatimento do Sinal PIX:
                </span>
                <span>- R$ {valorSinal.toFixed(2)}</span>
              </div>

              <div className="border-t border-zinc-800 pt-3 flex justify-between text-lg font-extrabold text-amber-400">
                <span>Saldo Restante a Receber:</span>
                <span>R$ {saldoAReceber.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Forma de Pagamento do Saldo Restante
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pos')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition ${
                    paymentMethod === 'pos'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Maquininha Física</p>
                    <p className="text-[10px] text-zinc-400">Smart POS</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('virtual')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition ${
                    paymentMethod === 'virtual'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Maquininha Virtual</p>
                    <p className="text-[10px] text-zinc-400">Link / App</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition ${
                    paymentMethod === 'pix'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">PIX Saldo</p>
                    <p className="text-[10px] text-zinc-400">QR Code Instantâneo</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('dinheiro')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition ${
                    paymentMethod === 'dinheiro'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Dinheiro Físico</p>
                    <p className="text-[10px] text-zinc-400">Espécie</p>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={handleFinalizeCheckout}
              className="w-full rose-gradient-btn text-white font-bold py-3.5 rounded-2xl flex items-center justify-center space-x-2 shadow-lg"
            >
              <DollarSign className="w-5 h-5" />
              <span>Receber R$ {saldoAReceber.toFixed(2)} & Dar Baixa</span>
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
