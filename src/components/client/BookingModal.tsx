import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Scissors
} from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { ServiceItem, Employee } from '../../types';

interface BookingModalProps {
  initialService?: ServiceItem | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ initialService, onClose }) => {
  const { services, employees, createAppointment, addToWaitlist, isBlockedClient, scheduleAppointmentReminders, upsertClient } = useSalon();

  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(initialService || services[0] || null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(employees[0] || null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState<string>('14:00');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientCpf, setClientCpf] = useState<string>('');
  const [clientBirthDate, setClientBirthDate] = useState<string>('');
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);
  
  const isBlocked = isBlockedClient(clientPhone, clientCpf);

  // Time slots generator (09:00 to 19:00)
  const generateTimeSlots = () => {
    if (isBlocked) return []; // Stealth Block: Return empty array silently
    
    const slots = [];
    for (let i = 9; i <= 19; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date(e.target.value + 'T12:00:00'); // Prevent timezone shift
    if (d.getDay() === 0 || d.getDay() === 1) {
      alert('O salão funciona apenas de Terça a Sábado.');
      return;
    }
    setSelectedDate(e.target.value);
  };

  const handleConfirmBooking = () => {
    if (!selectedService || !clientName || !clientPhone || !selectedDate || !selectedTime) return;

    if (isBlocked) return;

    const dataHoraIso = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();

    const app = createAppointment({
      cliente_nome: clientName,
      cliente_phone: clientPhone,
      cliente_cpf: clientCpf,
      cliente_data_nascimento: clientBirthDate,
      data_hora: dataHoraIso,
      servico_id: selectedService.id,
      profissional_id: selectedEmployee ? selectedEmployee.id : employees[0]?.id || '',
      status: 'aguardando_confirmacao',
      valor_total: selectedService.preco,
      metodo_pagamento: 'pendente'
    });

    if (!app) return;
    upsertClient({ nome: clientName, cpf: clientCpf, telefone: clientPhone, data_nascimento: clientBirthDate });
    scheduleAppointmentReminders(app, selectedService.nome);
    setCreatedAppointmentId(app.id);
    setStep(4); // Success step
  };

  const handleJoinWaitlist = () => {
    if (isBlocked) return;
    // Build waitlist entry without id (added in context)
    const entry = {
      cliente_nome: clientName,
      cliente_phone: clientPhone,
      data_hora: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
      servico_id: selectedService?.id || '',
      status: 'aguardando',
    } as any; // Omit<WaitlistEntry, 'id'>
    addToWaitlist(entry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative my-8">
        
        {/* Header Bar */}
        <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Agendamento Online</h3>
              {step < 4 && <p className="text-xs text-zinc-400">Passo {step} de 3</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Service & Employee */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                1. Escolha o Serviço
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {services.filter(s => s.ativo).map(srv => (
                  <button
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                      selectedService?.id === srv.id
                        ? 'bg-rose-950/40 border-rose-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">{srv.nome}</p>
                      <p className="text-xs text-zinc-400">{srv.duracao} min • R$ {srv.preco.toFixed(2)}</p>
                    </div>
                    {selectedService?.id === srv.id && <CheckCircle2 className="w-5 h-5 text-rose-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                2. Escolha o Profissional
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {employees.filter(e => e.ativo).map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center space-y-2 ${
                      selectedEmployee?.id === emp.id
                        ? 'bg-rose-950/40 border-rose-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={emp.foto_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
                      alt={emp.nome}
                      className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{emp.nome}</p>
                      <p className="text-[10px] text-zinc-400 truncate max-w-[100px]">{emp.especialidade}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedService}
              className="w-full rose-gradient-btn text-white font-bold py-3.5 rounded-2xl flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Client Info */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Maria Silva"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  WhatsApp com DDD *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 pl-2">Informe seu número para vermos os horários.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  CPF (opcional)
                </label>
                <input
                  type="text"
                  value={clientCpf}
                  onChange={(e) => setClientCpf(e.target.value)}
                  placeholder="Digite seu CPF"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Data de nascimento (opcional)</label>
                <input
                  type="date"
                  value={clientBirthDate}
                  onChange={(e) => setClientBirthDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3.5 rounded-2xl flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!clientName.trim() || clientPhone.length < 10}
                className="w-2/3 rose-gradient-btn text-white font-bold py-3.5 rounded-2xl flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
              >
                <span>Escolher Horário</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Escolha a Data (Terça a Sábado)</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={handleDateChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Horários Disponíveis (09:00 - 19:00)
              </label>
              
              {isBlocked ? (
                <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl text-center space-y-3">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Nenhum horário disponível</h4>
                    <p className="text-xs text-zinc-400">Desculpe, não temos horários disponíveis para o período selecionado. Por favor, entre em contato diretamente pelo nosso WhatsApp.</p>
                  </div>
                </div>
              ) : timeSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-xl text-xs font-bold border transition ${
                        selectedTime === time
                          ? 'bg-rose-600 text-white border-rose-500 shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl text-center space-y-3">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Nenhum horário disponível</h4>
                    <p className="text-xs text-zinc-400">A agenda está lotada para esta data ou os profissionais não estão disponíveis.</p>
                  </div>
                  <button 
                    onClick={handleJoinWaitlist}
                    className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Entrar na Fila de Espera
                  </button>
                </div>
              )}
            </div>

            {/* Summary Box */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Serviço:</span>
                <span className="font-bold text-white">{selectedService?.nome}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Profissional:</span>
                <span className="font-bold text-white">{selectedEmployee?.nome}</span>
              </div>
              <div className="border-t border-zinc-800 pt-2 flex justify-between text-sm">
                <span className="text-zinc-300 font-semibold">Valor Total:</span>
                <span className="font-extrabold text-white">R$ {selectedService?.preco.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3.5 rounded-2xl flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={timeSlots.length === 0}
                className="w-2/3 rose-gradient-btn text-white font-bold py-3.5 rounded-2xl flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
              >
                <span>Confirmar Agendamento</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success Message */}
        {step === 4 && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-2xl font-bold text-white mb-2">Agendamento Realizado!</h4>
              <p className="text-sm text-zinc-400">
                Sua reserva para <strong className="text-white">{selectedDate} às {selectedTime}</strong> foi registrada com sucesso.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-left text-sm text-zinc-300 space-y-2 mt-4">
               <p className="font-bold text-emerald-400">O que acontece agora?</p>
               <p>1. Você receberá um WhatsApp confirmando sua reserva.</p>
               <p>2. No dia do atendimento, procure o balcão.</p>
               <p>3. O pagamento (R$ {selectedService?.preco.toFixed(2)}) será realizado no local após o serviço.</p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-2xl transition"
            >
              Fechar e Voltar ao Site
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
