import React, { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle, Sparkles, User } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const ReviewSection: React.FC = () => {
  const { reviews, addClientReview, employees } = useSalon();
  
  const [name, setName] = useState('');
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const approvedReviews = reviews.filter(r => r.aprovado_para_site);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    addClientReview({
      cliente_nome: name,
      nota_estrelas: stars,
      comentario: comment,
      profissional_id: selectedEmp || undefined
    });

    setSubmitted(true);
    setName('');
    setComment('');
  };

  return (
    <section id="avaliacoes" className="py-16 bg-zinc-950/80 border-t border-zinc-900 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Depoimentos de Clientes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            O que Nossos Clientes Dizem
          </h2>
          <p className="text-zinc-400 text-sm mt-2 font-light">
            Sua opinião é fundamental para mantermos o padrão VIP de atendimento.
          </p>
        </div>

        {/* Approved Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {approvedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl backdrop-blur-md relative space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center font-bold text-rose-400">
                    {rev.cliente_nome.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{rev.cliente_nome}</h4>
                    <p className="text-[11px] text-zinc-400">Cliente Verificada</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= rev.nota_estrelas ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-light italic">
                "{rev.comentario}"
              </p>
            </div>
          ))}
        </div>

        {/* Submit Review Box */}
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-rose-400" />
              Avalie Nosso Atendimento
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Deixe seu comentário e nota de 1 a 5 estrelas.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-2xl text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-sm">Obrigado pela sua avaliação!</p>
              <p className="text-xs text-emerald-200/80">
                Sua mensagem foi enviada para a gestora e será exibida no site após moderação.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Ana Clara"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Profissional Atendido(a)</label>
                  <select
                    value={selectedEmp}
                    onChange={(e) => setSelectedEmp(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="">Equipe Geral</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Sua Nota em Estrelas</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStars(star)}
                      className="p-1 text-amber-400 focus:outline-none hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= stars ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`} />
                    </button>
                  ))}
                  <span className="text-xs text-amber-400 font-bold ml-2">{stars} de 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Comentário *</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte como foi sua experiência no salão..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rose-gradient-btn text-white font-bold py-3 rounded-xl text-xs shadow-lg"
              >
                Enviar Avaliação
              </button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
};
