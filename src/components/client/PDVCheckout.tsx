import React from 'react';

interface PDVCheckoutProps {
  appointment: any;
  onClose: () => void;
}

export const PDVCheckout: React.FC<PDVCheckoutProps> = ({ appointment, onClose }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
      <h3 className="text-xl font-bold text-white mb-4">PDV Checkout</h3>
      <p className="text-zinc-400">Placeholder for PDV checkout. Appointment ID: {appointment?.id || 'N/A'}</p>
      <button
        onClick={onClose}
        className="mt-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded"
      >
        Close
      </button>
    </div>
  );
};
