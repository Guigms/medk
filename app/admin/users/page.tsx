'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { 
  Users, UserPlus, Trash2, UserCog, X, Lock, ArrowLeft, Key, Target, Percent, Save, SlidersHorizontal 
} from 'lucide-react';

export default function UsuariosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modais de Controle
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditGoalsModalOpen, setIsEditGoalsModalOpen] = useState(false);
  
  // Estados para seleção/edição
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dados dos Formulários
  const [goalsData, setGoalsData] = useState({ commissionRate: '0', monthlyGoal: '0' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ATTENDANT',
    commissionRate: '0',
    monthlyGoal: '0'
  });

  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || isSuperAdmin;

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
      setIsCreateModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'ATTENDANT', commissionRate: '0', monthlyGoal: '0' });
      fetchTeam();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  // ⚡ AÇÃO: Abrir modal de edição de metas carregando os dados atuais
  const handleOpenEditGoals = (member: any) => {
    setSelectedMember({ id: member.id, name: member.name });
    setGoalsData({
      commissionRate: String(member.commissionRate || 0),
      monthlyGoal: String(member.monthlyGoal || 0)
    });
    setIsEditGoalsModalOpen(true);
  };

  // ⚡ AÇÃO: Salvar alterações de Meta e Comissão
  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedMember?.id, ...goalsData })
      });

      if (res.ok) {
        setIsEditGoalsModalOpen(false);
        fetchTeam();
      } else {
        alert('Erro ao atualizar metas.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return alert("A senha deve ter pelo menos 6 caracteres.");
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedMember?.id, newPassword })
      });

      if (res.ok) {
        alert('Senha atualizada com sucesso!');
        setIsPasswordModalOpen(false);
        setNewPassword('');
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao alterar senha.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === user?.id) return alert("Não pode remover o seu próprio acesso!");
    if (!confirm("Tem certeza que deseja remover este acesso?")) return;

    const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchTeam();
  };

  if (user && !isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl max-w-md text-center border border-red-100 dark:border-red-950/40">
            <Lock size={40} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Acesso Restrito</h2>
            <button onClick={() => router.back()} className="w-full bg-[#253289] text-white py-3 rounded-xl font-black mt-4">Voltar</button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 bg-background text-foreground min-h-screen transition-colors duration-300">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 rounded-xl shadow-sm transition-all cursor-pointer">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2"><Users size={32} className="text-[#253289] dark:text-blue-400" /> Gestão da Equipe</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Controle acessos, comissões e metas mensais dos vendedores.</p>
            </div>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-[#253289] dark:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-[#1a2461] transition-all cursor-pointer shadow-md">
            <UserPlus size={20} /> Novo Membro
          </button>
        </div>

        {/* GRID DE MEMBROS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team
            .filter((member) => isSuperAdmin || member.role !== 'SUPER_ADMIN')
            .map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition-all relative">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-[#253289] dark:text-blue-400 font-black text-xl border">
                    {member.name.charAt(0)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${member.role === 'SUPER_ADMIN' ? 'bg-emerald-100 text-emerald-700' : member.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {member.role === 'SUPER_ADMIN' ? 'Master' : member.role === 'ADMIN' ? 'Administrador' : 'Atendente'}
                  </span>
                </div>
                
                <h3 className="font-black text-gray-900 dark:text-gray-100 text-lg tracking-tight mb-0.5">{member.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">{member.email}</p>
                
                {/* INDICADORES COMERCIAIS */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-3 py-2 rounded-xl text-xs font-black border border-emerald-100 dark:border-emerald-900/30">
                    <Percent size={14} /> Comissão: {Number(member.commissionRate || 0).toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-xl text-xs font-black border border-blue-100 dark:border-blue-900/30">
                    <Target size={14} /> Meta Mensal: {formatPrice(member.monthlyGoal || 0)}
                  </div>
                </div>
              </div>
              
              {/* RODAPÉ DO CARD / AÇÕES */}
              <div className="flex items-center justify-between pt-4 mt-5 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-medium text-gray-400">Cadastro: {new Date(member.createdAt).toLocaleDateString('pt-BR')}</p>
                <div className="flex items-center gap-1">
                  
                  {/* Botão: Editar Metas */}
                  <button onClick={() => handleOpenEditGoals(member)} className="text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors cursor-pointer" title="Configurar Metas e Comissões">
                    <SlidersHorizontal size={16} />
                  </button>

                  {/* Botão: Trocar Senha */}
                  <button onClick={() => { setSelectedMember({ id: member.id, name: member.name }); setIsPasswordModalOpen(true); }} className="text-gray-400 hover:text-amber-500 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors cursor-pointer" title="Redefinir Senha">
                    <Key size={16} />
                  </button>

                  {/* Botão: Remover */}
                  {member.id !== user?.id && (
                    <button onClick={() => handleDelete(member.id)} className="text-gray-300 hover:text-red-500 p-2 transition-colors cursor-pointer" title="Remover Membro">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 🌟 MODAL: CONFIGURAR METAS E COMISSÕES */}
        {isEditGoalsModalOpen && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-[#253289] dark:bg-gray-950 p-6 text-white flex justify-between items-center">
                <h2 className="text-base font-black flex items-center gap-2 uppercase tracking-wide"><Target size={18}/> Metas Comerciais</h2>
                <button onClick={() => setIsEditGoalsModalOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"><X size={18}/></button>
              </div>
              <form onSubmit={handleSaveGoals} className="p-6 space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ajuste os parâmetros de performance de <strong>{selectedMember?.name}</strong></p>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Meta Mensal de Venda (R$)</label>
                  <input required type="number" step="0.01" min="0" className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black"
                    value={goalsData.monthlyGoal} onChange={e => setGoalsData({...goalsData, monthlyGoal: e.target.value})} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Porcentagem de Comissão (%)</label>
                  <input required type="number" step="0.1" min="0" max="100" className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black"
                    value={goalsData.commissionRate} onChange={e => setGoalsData({...goalsData, commissionRate: e.target.value})} />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-[#253289] dark:bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg shadow-blue-100 dark:shadow-none mt-4 hover:bg-[#1a2461] transition-all flex justify-center items-center gap-2 cursor-pointer text-sm">
                  <Save size={18} /> Salvar Parâmetros
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REDEFINIR SENHA TEMPORÁRIA */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-gray-800">
              <div className="bg-amber-500 p-6 text-white flex justify-between items-center">
                <h2 className="text-base font-black flex items-center gap-2 uppercase tracking-wide"><Key size={18}/> Alterar Senha</h2>
                <button onClick={() => setIsPasswordModalOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"><X size={18}/></button>
              </div>
              <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Defina uma nova credencial para <strong>{selectedMember?.name}</strong></p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Nova Senha de Acesso</label>
                  <input required type="text" minLength={6} className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-mono font-bold text-center tracking-widest text-lg"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-black shadow-lg mt-4 transition-all cursor-pointer text-sm">
                  Atualizar Senha
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CADASTRO DE NOVO MEMBRO */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-gray-800">
              <div className="bg-[#253289] dark:bg-gray-950 p-6 text-white flex justify-between items-center">
                <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-wide"><UserCog size={20}/> Adicionar Membro</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"><X size={18}/></button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Nome Completo</label>
                  <input required type="text" className="w-full p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">E-mail corporativo</label>
                  <input required type="email" className="w-full p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Senha Temporária</label>
                  <input required type="password" minLength={6} className="w-full p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Nível de Acesso</label>
                    <select className="w-full p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl outline-none font-black text-gray-600 dark:text-gray-300 cursor-pointer"
                      value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="ATTENDANT">Atendente</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                  
                  <div className={`space-y-1.5 transition-all duration-300 ${formData.role === 'ADMIN' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider ml-1">Comissão (%)</label>
                    <input type="number" step="0.1" min="0" className="w-full p-3 bg-emerald-50 dark:bg-gray-950 text-emerald-900 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-center" 
                      value={formData.commissionRate} onChange={e => setFormData({...formData, commissionRate: e.target.value})} />
                  </div>
                </div>

                <div className={`space-y-1.5 transition-all duration-300 ${formData.role === 'ADMIN' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider ml-1">Meta Mensal Inicial (R$)</label>
                  <input type="number" step="0.01" min="0" className="w-full p-3 bg-blue-50 dark:bg-gray-950 text-blue-900 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-center" 
                    value={formData.monthlyGoal} onChange={e => setFormData({...formData, monthlyGoal: e.target.value})} />
                </div>

                <button type="submit" className="w-full bg-[#253289] dark:bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg shadow-blue-100 dark:shadow-none mt-4 hover:bg-[#1a2461] transition-all cursor-pointer text-base">
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