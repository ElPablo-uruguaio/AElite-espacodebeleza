import React, { useState } from 'react';
import { Banknote, Check, CreditCard, Loader2, QrCode, X } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { Appointment } from '../../types';

interface PDVCheckoutProps {
  appointment: Appointment;
  onClose: () => void;
}

export const PDVCheckout: React.FC<PDVCheckoutProps> = ({ appointment, onClose }) => {
  const { checkoutAppointment } = useSalon();
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'credito' | 'debito' | 'pix'>('dinheiro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentOptions = [
    { value: 'dinheiro' as const, label: 'Dinheiro', icon: Banknote },
    { value: 'credito' as const, label: 'Cartão de Crédito', icon: CreditCard },
    { value: 'debito' as const, label: 'Cartão de Débito', icon: CreditCard },
    { value: 'pix' as const, label: 'Pix', icon: QrCode },
  ];

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      checkoutAppointment(appointment.id, paymentMethod);
      onClose();
    } catch {
      setError('Não foi possível finalizar o atendimento. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Fechar fechamento de caixa"
          className="absolute right-4 top-4 text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 pr-8">
          <h3 className="text-xl font-bold text-white">Fechamento de caixa</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Finalizar atendimento de <span className="font-semibold text-white">{appointment.cliente_nome}</span>
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Total do atendimento</span>
            <span className="text-lg font-bold text-amber-400">
              R$ {appointment.valor_total.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <fieldset disabled={loading}>
          <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
            Forma de pagamento
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {paymentOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value)}
                aria-pressed={paymentMethod === value}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  paymentMethod === value
                    ? 'border-rose-500 bg-rose-950/40 text-white'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 text-rose-400" />
                <span className="text-xs font-semibold">{label}</span>
                {paymentMethod === value && <Check className="ml-auto h-4 w-4 text-rose-400" />}
              </button>
            ))}
          </div>
        </fieldset>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3.5 font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          <span>{loading ? 'Finalizando atendimento...' : 'Confirmar e Finalizar Atendimento'}</span>
        </button>
      </div>
    </div>
  );
};
