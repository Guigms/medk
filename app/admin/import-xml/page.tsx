'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation'; // 🌟 Importado para a funcionalidade de voltar
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { UploadCloud, AlertCircle, ShieldAlert, CheckCircle2, Package, ArrowLeft } from 'lucide-react';

type ImportStatus = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'BLOCKED' | 'DUPLICATE';

export default function ImportarXmlPage() {
  const { user } = useAuth();
  const router = useRouter(); // 🌟 Inicializado
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>('IDLE');
  const [report, setReport] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('IDLE');
      setReport(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setStatus('PROCESSING');
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const xmlContent = e.target?.result as string;
        
        setTimeout(async () => {
          const response = await fetch('/api/stock/import-xml', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xmlData: xmlContent })
          });

          const data = await response.json();
          
          if (response.ok) {
            setReport(data.results || data); 
            
            if (data.status === 'BLOCKED') {
              setStatus('BLOCKED');
            } else if (data.status === 'SUCCESS') {
              setStatus('SUCCESS');
            } else if (data.status === 'DUPLICATE') {
              setStatus('DUPLICATE');
            }
          } else {
            alert(`Erro: ${data.error}`);
            setStatus('IDLE');
          }
        }, 1500); 
      };

      reader.readAsText(file);

    } catch (error) {
      console.error(error);
      alert('Erro interno ao processar o arquivo.');
      setStatus('IDLE');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
        
        {/* 🌟 CABEÇALHO PADRONIZADO COM BOTÃO DE VOLTAR */}
        <header className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition-all border border-gray-100 dark:border-gray-700 flex items-center group cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">Importação de NF-e (XML)</h1>
              <p className="hidden md:block text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">Regra de Segurança MedK: Nota Inédita e Produtos Cadastrados</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          
          {/* TELA INICIAL (UPLOAD) */}
          {status === 'IDLE' && (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 text-center animate-in fade-in transition-colors">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/40 text-[#253289] dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <UploadCloud size={40} />
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Selecione o arquivo da Nota Fiscal</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Apenas arquivos no formato .xml são aceitos.</p>
              
              <div className="flex flex-col items-center gap-4">
                <input 
                  type="file" 
                  accept=".xml" 
                  onChange={handleFileChange}
                  className="block w-full max-w-sm text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-blue-50 file:text-[#253289] dark:file:bg-gray-800 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-gray-700 cursor-pointer transition-all"
                />
                
                <button 
                  onClick={handleImport}
                  disabled={!file}
                  className="w-full max-w-sm bg-[#25D366] text-white py-4 rounded-xl font-black text-lg hover:bg-[#1ebe57] transition-all shadow-lg shadow-green-100 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4 cursor-pointer"
                >
                  Processar Estoque
                </button>
              </div>
            </div>
          )}

          {/* PROCESSANDO */}
          {status === 'PROCESSING' && (
            <div className="bg-white dark:bg-gray-900 p-16 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-300 transition-colors">
              <div className="w-20 h-20 border-4 border-blue-100 dark:border-gray-800 border-t-[#253289] dark:border-t-blue-500 rounded-full animate-spin mb-8 shadow-inner"></div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Processando Nota Fiscal...</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-md mx-auto">Lendo o XML, validando produtos e checando as regras de negócio.</p>
              <div className="mt-6 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                Por favor, não feche ou atualize a página.
              </div>
            </div>
          )}

          {/* DUPLICADA */}
          {status === 'DUPLICATE' && report && (
            <div className="bg-amber-50 dark:bg-amber-950/20 p-12 rounded-3xl shadow-sm border-2 border-amber-200 dark:border-amber-900/30 text-center animate-in zoom-in-95">
              <ShieldAlert className="text-amber-500 dark:text-amber-400 mx-auto mb-4" size={64} />
              <h2 className="text-3xl font-black text-amber-900 dark:text-amber-300 mb-4">Nota Fiscal Duplicada!</h2>
              <p className="text-amber-800 dark:text-amber-400 font-medium text-lg mb-2">
                {report.message}
              </p>
              {report.supplier && (
                <div className="mt-6 pt-6 border-t border-amber-200/50 dark:border-amber-800/50 inline-block">
                  <p className="text-amber-700 dark:text-amber-500 text-sm uppercase tracking-widest font-bold mb-1">Fornecedor</p>
                  <p className="text-amber-900 dark:text-amber-200 font-black text-xl">{report.supplier}</p>
                </div>
              )}
              <div className="mt-8">
                <button onClick={() => { setStatus('IDLE'); setFile(null); }} className="bg-white dark:bg-gray-800 text-amber-700 dark:text-amber-400 font-black px-8 py-3 rounded-xl border-2 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-gray-700 transition-colors shadow-sm cursor-pointer">
                  Importar Outro Arquivo
                </button>
              </div>
            </div>
          )}

          {/* BLOQUEADA (FALTA CADASTRO) */}
          {status === 'BLOCKED' && report && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-3xl shadow-sm border-2 border-red-200 dark:border-red-900/30 text-center">
                <ShieldAlert className="text-red-500 dark:text-red-400 mx-auto mb-4" size={56} />
                <h2 className="text-2xl font-black text-red-900 dark:text-red-300 mb-2">Importação Bloqueada!</h2>
                <p className="text-red-700 dark:text-red-400 font-medium mb-4">
                  A nota fiscal foi rejeitada porque contém produtos que <strong>não existem</strong> no sistema. NENHUM estoque foi atualizado.
                </p>
                <button onClick={() => setStatus('IDLE')} className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 font-bold px-6 py-2.5 rounded-xl border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  Tentar Novamente
                </button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/50 overflow-hidden transition-colors">
                <div className="bg-white dark:bg-gray-900 p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-950/40 rounded-lg text-red-500 dark:text-red-400"><AlertCircle size={20} /></div>
                  <h3 className="font-black text-gray-900 dark:text-white">Produtos Pendentes de Cadastro</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-950 text-[10px] uppercase text-gray-400 dark:text-gray-500 font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Nome na Nota Fiscal</th>
                        <th className="px-6 py-3">Código Lançado (DUN/EAN)</th>
                        <th className="px-6 py-3 text-center">Ação Necessária</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {report.notFound.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-red-50/30 dark:hover:bg-gray-800/20 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{item.name}</td>
                          <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400">{item.ean || item.reason}</td>
                          <td className="px-6 py-4 text-center">
                            <Link href="/admin/produtos/novo" className="text-xs font-black text-[#253289] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-4 py-2 Bone rounded-lg hover:bg-blue-100 dark:hover:bg-gray-800 border border-blue-100 dark:border-blue-900/50">
                              Cadastrar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {status === 'SUCCESS' && report && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="bg-emerald-500 p-8 rounded-3xl shadow-lg shadow-emerald-200 dark:shadow-none text-center text-white">
                <CheckCircle2 className="mx-auto mb-4 opacity-90" size={64} />
                <h2 className="text-3xl font-black mb-2">Estoque Atualizado!</h2>
                <p className="font-medium text-emerald-50 mb-6">Todos os produtos foram identificados e a nota foi dada entrada com sucesso.</p>
                <div className="flex justify-center gap-4">
                  <Link href="/admin/produtos" className="bg-white text-emerald-600 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm">
                    Ver Catálogo
                  </Link>
                  <button onClick={() => { setStatus('IDLE'); setFile(null); }} className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl border border-emerald-400 hover:bg-emerald-700 transition-colors cursor-pointer">
                    Importar Outra Nota
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-emerald-100 dark:border-emerald-900/50 overflow-hidden transition-colors">
                <div className="bg-white dark:bg-gray-900 p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-500 dark:text-emerald-400"><Package size={20} /></div>
                    <h3 className="font-black text-gray-900 dark:text-white">Resumo da Operação</h3>
                  </div>
                  <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                    {report.success.length} itens recebidos
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-950 text-[10px] uppercase text-gray-400 dark:text-gray-500 font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Produto no Sistema</th>
                        <th className="px-6 py-3 text-center">Código Lido</th>
                        <th className="px-6 py-3 text-center">Qtd. Nota</th>
                        <th className="px-6 py-3 text-center">Entrada Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {report.success.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-emerald-50/30 dark:hover:bg-gray-800/20 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{item.name}</td>
                          <td className="px-6 py-4 text-center font-mono text-gray-500 dark:text-gray-400">{item.ean}</td>
                          <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">{item.quantity} un</td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                              + {item.finalQuantity} un
                            </span>
                            {item.isClosedBox && <span className="block text-[10px] text-emerald-500 dark:text-emerald-400 mt-1.5 font-bold uppercase tracking-tight">Fator x Aplicado</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </ProtectedRoute>
  );
}