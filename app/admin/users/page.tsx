'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Users, UserPlus, Trash2, UserCog, X, Lock } from 'lucide-react';

export default function UsuariosPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 🌟 NOVO: Adicionado 'commissionRate' no estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ATTENDANT',
    commissionRate: '0' 
  });

  const fetchTeam = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) setTeam(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchTeam(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'ATTENDANT', commissionRate: '0' });
      fetchTeam();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === user?.id) return alert("Não pode remover o seu próprio acesso!");
    if (!confirm("Tem certeza que deseja remover este acesso?")) return;

    const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchTeam();
  };

  if (user?.role !== 'ADMIN') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-red-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Acesso Restrito</h2>
            <p className="text-gray-500 mb-6">Apenas administradores podem gerir a equipa da MedK.</p>
            <button onClick={() => window.history.back()} className="bg-[#253289] text-white px-6 py-3 rounded-xl font-bold">Voltar ao Painel</button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#253289] flex items-center gap-2">
              <Users size={32} /> Gestão da Equipe
            </h1>
            <p className="text-gray-500">Adicione membros e defina metas e comissões.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#253289] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-blue-100 transition-all"
          >
            <UserPlus size={20} /> Novo Membro
          </button>
        </div>

        {/* Lista de Utilizadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <div key={member.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-[#253289] font-black text-xl">
                  {member.name.charAt(0)}
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  member.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {member.role === 'ADMIN' ? 'Administrador' : 'Atendente'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{member.email}</p>
                
                {/* 🌟 NOVO: Exibe a comissão se o usuário tiver uma taxa maior que 0 */}
                {Number(member.commissionRate) > 0 && (
                  <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-100">
                    💰 {Number(member.commissionRate).toFixed(1)}% de Comissão
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
                <p className="text-[10px] text-gray-400">Desde: {new Date(member.createdAt).toLocaleDateString()}</p>
                {member.id !== user?.id && (
                  <button onClick={() => handleDelete(member.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Cadastro */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
              <div className="bg-[#253289] p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2"><UserCog /> Adicionar Membro</h2>
                <button onClick={() => setIsModalOpen(false)}><X /></button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase">Nome Completo</label>
                  <input required type="text" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#253289]" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase">E-mail</label>
                  <input required type="email" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#253289]" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase">Senha Temporária</label>
                  <input required type="password" title="Mínimo 6 caracteres" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#253289]" 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase">Acesso</label>
                    <select className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#253289] font-bold"
                      value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="ATTENDANT">Atendente</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                  
                  {/* 🌟 NOVO: Campo de Comissão (Mostra mais destaque se for atendente) */}
                  <div className={`space-y-1 transition-opacity ${formData.role === 'ADMIN' ? 'opacity-50' : 'opacity-100'}`}>
                    <label className="text-xs font-black text-emerald-600 uppercase">Comissão (%)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="100" 
                      placeholder="Ex: 5"
                      className="w-full p-3 bg-emerald-50 text-emerald-900 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold" 
                      value={formData.commissionRate} 
                      onChange={e => setFormData({...formData, commissionRate: e.target.value})} 
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#253289] text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 mt-4">
                  Criar Conta de Acesso
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}