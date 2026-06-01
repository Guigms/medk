'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft, Loader2, Eye, EyeOff, LayoutDashboard, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      router.push('/admin/dashboard');
    } else {
      setError('Credenciais incorretas. Verifique seu e-mail e senha.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-950 transition-colors duration-300">
      
      {/* 🌟 PAINEL ESQUERDO: Branding Genérico e Premium (Oculto no Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-[#253289] relative items-center justify-center overflow-hidden">
        {/* Elementos de fundo abstratos */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#253289] to-[#111847] z-0"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-3xl mix-blend-overlay"></div>
        
        {/* Conteúdo Institucional White-Label */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center max-w-lg">
          
          {/* Símbolo de Gestão Elegante */}
          <div className="w-32 h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] flex flex-col items-center justify-center shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500 group">
            <LayoutDashboard size={48} className="text-white group-hover:-translate-y-1 transition-transform" strokeWidth={1.5} />
            <TrendingUp size={24} className="text-blue-300 absolute bottom-6 right-6 opacity-50" strokeWidth={2} />
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight mb-4 leading-tight">
            Gestão inteligente para o seu negócio.
          </h1>
          <p className="text-blue-100/80 text-lg font-medium leading-relaxed">
            Acesse o painel administrativo para acompanhar vendas, gerir estoque e analisar resultados em tempo real.
          </p>
        </div>
      </div>

      {/* 🌟 PAINEL DIREITO: Formulário de Login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-24 relative">
        
        {/* Botão de Voltar */}
        <div className="absolute top-8 right-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Voltar ao site</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Símbolo exibido apenas no Mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="relative w-20 h-20 bg-[#253289] rounded-2xl shadow-lg border border-[#111847] flex items-center justify-center">
               <LayoutDashboard size={36} className="text-white" strokeWidth={1.5} />
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Bem-vindo(a) de volta</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Insira suas credenciais de acesso para continuar.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded-r-xl mb-8 text-sm font-bold animate-in slide-in-from-left-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Campo de E-mail */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                E-mail Corporativo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#253289] dark:group-focus-within:text-blue-400 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-[#253289]/20 focus:border-[#253289] dark:focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium transition-all"
                  placeholder="exemplo@suaempresa.com.br"
                />
              </div>
            </div>

            {/* Campo de Senha */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Senha de Acesso
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#253289] dark:group-focus-within:text-blue-400 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-[#253289]/20 focus:border-[#253289] dark:focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Botão de Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#253289] hover:bg-[#1a2461] dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-4 rounded-2xl transition-all font-black text-sm uppercase tracking-wide shadow-xl shadow-[#253289]/20 dark:shadow-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Autenticando...
                </>
              ) : (
                'Acessar Sistema'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}