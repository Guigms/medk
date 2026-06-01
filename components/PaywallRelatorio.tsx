import { Lock } from 'lucide-react'; // ou o ícone que preferir

interface PaywallProps {
  titulo: string;
  descricao: string;
}

export default function PaywallRelatorio({ titulo, descricao }: PaywallProps) {
  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 flex items-center justify-center">
      
      {/* 🔮 Background Simulado Borrado (Dá o efeito de que o relatório existe por trás) */}
      <div className="absolute inset-0 filter blur-md opacity-20 dark:opacity-10 pointer-events-none select-none grid grid-cols-3 gap-4 p-8">
        <div className="bg-gray-400 h-32 rounded-xl animate-pulse" />
        <div className="bg-gray-400 h-48 rounded-xl animate-pulse" />
        <div className="bg-gray-400 h-24 rounded-xl animate-pulse" />
        <div className="col-span-3 bg-gray-400 h-40 rounded-xl animate-pulse" />
      </div>

      {/* 🔒 Card de Bloqueio Central */}
      <div className="relative z-10 max-w-md mx-auto text-center p-8 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 m-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-100 dark:border-amber-900/40 shadow-inner">
          <Lock size={24} className="animate-bounce" />
        </div>
        
        <h3 className="text-xl font-black text-gray-950 dark:text-white tracking-tight mb-2">
          {titulo}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6">
          {descricao}
        </p>

        {/* 🚀 Botão com link direto para o seu WhatsApp comercial */}
        <a 
          href="https://wa.me/85992000696?text=Olá! Gostaria de desbloquear o relatório de Inteligência Avançada no meu painel MedK."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white py-3.5 px-6 rounded-xl font-black shadow-lg shadow-green-100 dark:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer text-sm"
        >
          Solicitar Ativação Deste Módulo
        </a>
      </div>
    </div>
  );
}