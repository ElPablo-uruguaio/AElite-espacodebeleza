import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { useAuth } from '../context/AuthContext';
import { DashboardStats } from '../components/gestora/DashboardStats';
import { AgendaCalendar } from '../components/gestora/AgendaCalendar';
import { PayrollManager } from '../components/gestora/PayrollManager';
import { ReviewsModeration } from '../components/gestora/ReviewsModeration';
import { NotificationsManager } from '../components/gestora/NotificationsManager';
import { AppointmentRemindersManager } from '../components/gestora/AppointmentRemindersManager';
import { LandingPageManager } from '../components/gestora/LandingPageManager';
import { QRCodeManager } from '../components/gestora/QRCodeManager';
import { CMSManager } from '../components/gestora/CMSManager';
import { StockManager } from '../components/gestora/StockManager';
import { AbsenceManager } from '../components/gestora/AbsenceManager';
import { StealthBlockManager } from '../components/gestora/StealthBlockManager';
import { TeamPermissionsManager } from '../components/gestora/TeamPermissionsManager';
import { ClientManager } from '../components/gestora/ClientManager';
import { MediaManager } from '../components/gestora/MediaManager';
import { PDVCheckout } from '../components/client/PDVCheckout';
import { CalendarClock, ShieldAlert, Package, FileText, Calendar, Users, MessageSquare, Bell, Target, QrCode, Settings, Scissors, Home, LogOut, Sparkles, Image as ImageIcon } from 'lucide-react';

export const GestoraDashboard: React.FC = () => {

  const [activeTab, setActiveTab] = useState<'agenda' | 'payroll' | 'cms' | 'reviews' | 'notifications' | 'reminders' | 'clients' | 'qrcode' | 'landing_pages' | 'estoque' | 'fichas' | 'midias' | 'ausencias' | 'stealth' | 'permissions'>('agenda');
  const [selectedPDVAppointment, setSelectedPDVAppointment] = useState<any>(null);
  const { settings } = useSalon();
  const { user, logout } = useAuth();

  const handleGoToPublicHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      window.history.pushState({}, '', '/');
    }
    window.location.hash = '';
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      
      {/* Top Manager Header */}
      <header className="max-w-7xl mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-3xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 flex items-center justify-center text-white shadow-lg">
            <Scissors className="w-6 h-6 transform -rotate-45" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Painel Operacional da Gestora
            </h1>
            <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> {settings.nome_salao} • Bem-vinda, {user?.full_name || 'Gestora'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/"
            onClick={handleGoToPublicHome}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-zinc-700 flex items-center gap-1.5 transition"
          >
            <Home className="w-4 h-4 text-rose-400" />
            <span>Ver Site Público</span>
          </a>
          <button
            onClick={logout}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-zinc-700 flex items-center gap-1.5 transition"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Stats */}
      <div className="max-w-7xl mx-auto">
        <DashboardStats />
      </div>

      {/* Big Navigation Buttons Bar */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-3">
          
          <button
            onClick={() => setActiveTab('agenda')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'agenda'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Calendar className="w-6 h-6" />
            <span>Agenda & Caixa</span>
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'payroll'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Users className="w-6 h-6" />
            <span>Folha/Comissões</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'reviews'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <MessageSquare className="w-6 h-6" />
            <span>Recados & Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'notifications'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Bell className="w-6 h-6" />
            <span>Push Promoções</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'reminders'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Bell className="w-6 h-6" />
            <span>Lembretes</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'clients'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Users className="w-6 h-6" />
            <span>Gestão de Clientes</span>
          </button>

          <button
            onClick={() => setActiveTab('landing_pages')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'landing_pages'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Target className="w-6 h-6" />
            <span>Landing Pages</span>
          </button>

          <button
            onClick={() => setActiveTab('qrcode')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'qrcode'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <QrCode className="w-6 h-6" />
            <span>QR Balcão</span>
          </button>

          <button
            onClick={() => setActiveTab('midias')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'midias'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <ImageIcon className="w-6 h-6" />
            <span>Mídias / Stories</span>
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'cms'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span>CMS / Site</span>
          </button>

          <button
            onClick={() => setActiveTab('estoque')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'estoque'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Package className="w-6 h-6" />
            <span>Estoque</span>
          </button>

          <button
            onClick={() => setActiveTab('fichas')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'fichas'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <FileText className="w-6 h-6" />
            <span>Fichas Técnicas</span>
          </button>

          <button
            onClick={() => setActiveTab('stealth')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'stealth'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <ShieldAlert className="w-6 h-6" />
            <span>Bloqueio Silencioso</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-2 border transition shadow ${
              activeTab === 'permissions'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Users className="w-6 h-6" />
            <span>Permissões da Equipe</span>
          </button>

        </div>
      </div>

      {/* Active Tab Component Render */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'agenda' && (
          <AgendaCalendar onOpenPDV={(app) => setSelectedPDVAppointment(app)} />
        )}

        {activeTab === 'payroll' && <PayrollManager />}
        {activeTab === 'reviews' && <ReviewsModeration />}
        {activeTab === 'notifications' && <NotificationsManager />}
        {activeTab === 'reminders' && <AppointmentRemindersManager />}
        {activeTab === 'clients' && <ClientManager />}
        {activeTab === 'landing_pages' && <LandingPageManager />}
        {activeTab === 'qrcode' && <QRCodeManager />}
        {activeTab === 'midias' && <MediaManager />}
        {activeTab === 'cms' && <CMSManager />}
        {activeTab === 'estoque' && <StockManager />}
        {activeTab === 'stealth' && <StealthBlockManager />}
        {activeTab === 'permissions' && <TeamPermissionsManager />}
        {activeTab === 'fichas' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl text-center">
            <FileText className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Fichas Técnicas / Anamnese</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              As Fichas Técnicas são acessadas diretamente pela <strong className="text-rose-400">Agenda</strong> — 
              clique no botão <strong className="text-purple-400">"Ficha Técnica"</strong> no card de cada cliente para 
              consultar ou editar o histórico de químicas, fórmulas, alergias e observações.
            </p>
          </div>
        )}
      </div>

      {/* PDV Checkout Modal */}
      {selectedPDVAppointment && (
        <PDVCheckout
          appointment={selectedPDVAppointment}
          onClose={() => setSelectedPDVAppointment(null)}
        />
      )}

    </div>
  );

  // existing component code remains unchanged
};

