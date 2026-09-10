import React from 'react';
import { useSalon } from '../../context/SalonContext';

export const AbsenceManager: React.FC = () => {
  const { absences, addAbsence, removeAbsence } = useSalon();
  // Placeholder UI
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
      <h3 className="text-xl font-bold text-white mb-4">Gestão de Ausências</h3>
      <p className="text-zinc-400">Esta é uma implementação placeholder. Integre a lógica de ausências aqui.</p>
    </div>
  );
};
