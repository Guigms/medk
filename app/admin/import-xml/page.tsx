'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { UploadCloud, FileText, CheckCircle, AlertCircle, LayoutDashboard, ShieldAlert, CheckCircle2, Package } from 'lucide-react';

type ImportStatus = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'BLOCKED';

export default function ImportarXmlPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>('IDLE');
  const [relatorio, setRelatorio] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('IDLE');
      setRelatorio(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setStatus('PROCESSING');
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const xmlContent = e.target?.result as string;

        // Simulando um tempo de processamento para melhor UX
        setTimeout(async () => {
          const response = await fetch('/api/stock/import-xml', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xmlData: xmlContent })
          });

          const data = await response.json();
          
          if (response.ok) {
            setRelatorio(data.resultados);
            if (data.status === 'BLOCKED') {
              setStatus('BLOCKED');
            } else if (data.status === 'SUCCESS') {
              setStatus('SUCCESS');
            }
          } else {
            alert(`Erro: ${data.error}`);
            setStatus('IDLE');
          }
        }, 1500); // 1.5s de delay simulado para a tela de loading aparecer
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
      <div className="min-h-screen bg-gray-100 pb-20">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/admin/produtos" className="text-[#253289] hover:underline text-xs flex items-center gap-1 mb-1 font-bold">
              ← Voltar para Produtos
            </Link>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Importação de NF-e (XML)</h1>
            <p className="text-sm text-gray-500">Regra de Segurança: A nota só será importada se 100% dos produtos estiverem cadastrados.</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          
          {/* TELA 1: UPLOAD (Quando está IDLE) */}
          {status === 'IDLE' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 text-center animate-in fade-in">
              <div className="w-20 h-20 bg-blue-50 text-[#253289] rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud size={40} />
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-2">Selecione o arquivo da Nota Fiscal</h2>
              <p className="text-gray-500 mb-6 text-sm">Apenas arquivos no formato .xml são aceitos.</p>
              
              <div className="flex flex-col items-center gap-4">
                <input 
                  type="file" 
                  accept=".xml" 
                  onChange={handleFileChange}
                  className="block w-full max-w-sm text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-black file:bg-blue-50 file:text-[#253289] hover:file:bg-blue-100 cursor-pointer transition-all"
                />
                
                <button 
                  onClick={handleImport}
                  disabled={!file}
                  className="w-full max-w-sm bg-[#25D366] text-white py-4 rounded-xl font-black text-lg hover:bg-[#1ebe57] transition-all shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
                >
                  Processar Estoque
                </button>
              </div>
            </div>
          )}

          {/* TELA 2: PROCESSANDO */}
          {status === 'PROCESSING' && (
            <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-200 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 border-4 border-blue-100 border-t-[#253289] rounded-full animate-spin mb-8 shadow-inner"></div>
              <h2 className="text-3xl font-black text-gray-900 mb-3">Processando Nota Fiscal...</h2>
              <p className="text-gray-500 font-medium text-lg max-w-md mx-auto">Lendo o XML, validando produtos e checando as regras de negócio.</p>
              <div className="mt-6 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                Por favor, não feche ou atualize a página.
              </div>
            </div>
          )}

          {/* TELA 3: BLOQUEADO (Regra de Negócio não atendida) */}
          {status === 'BLOCKED' && relatorio && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="bg-red-50 p-8 rounded-3xl shadow-sm border-2 border-red-200 text-center">
                <ShieldAlert className="text-red-500 mx-auto mb-4" size={56} />
                <h2 className="text-2xl font-black text-red-900 mb-2">Importação Bloqueada!</h2>
                <p className="text-red-700 font-medium mb-4">
                  A nota fiscal foi rejeitada porque contém produtos que <strong>não existem</strong> no sistema. NENHUM estoque foi atualizado.
                </p>
                <button onClick={() => setStatus('IDLE')} className="bg-white text-red-600 font-bold px-6 py-2.5 rounded-xl border border-red-200 hover:bg-red-100 transition-colors">
                  Tentar Novamente
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
                <div className="bg-white p-6 border-b border-gray-100 flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg text-red-500"><AlertCircle size={20} /></div>
                  <h3 className="font-black text-gray-900">Produtos Pendentes de Cadastro</h3>
                </div>
                <div className="p-0">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Nome na Nota Fiscal</th>
                        <th className="px-6 py-3">Código Lançado (DUN/EAN)</th>
                        <th className="px-6 py-3 text-center">Ação Necessária</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {relatorio.naoEncontrado.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-red-50/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-800">{item.nome}</td>
                          <td className="px-6 py-4 font-mono text-gray-500">{item.ean || item.motivo}</td>
                          <td className="px-6 py-4 text-center">
                            <Link href="/admin/produtos/novo" className="text-xs font-black text-[#253289] bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 border border-blue-100">
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

          {/* TELA 4: SUCESSO */}
          {status === 'SUCCESS' && relatorio && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="bg-emerald-500 p-8 rounded-3xl shadow-lg shadow-emerald-200 text-center text-white">
                <CheckCircle2 className="mx-auto mb-4 opacity-90" size={64} />
                <h2 className="text-3xl font-black mb-2">Estoque Atualizado!</h2>
                <p className="font-medium text-emerald-50 mb-6">Todos os produtos foram identificados e a nota foi dada entrada com sucesso.</p>
                <div className="flex justify-center gap-4">
                  <Link href="/admin/produtos" className="bg-white text-emerald-600 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm">
                    Ver Catálogo
                  </Link>
                  <button onClick={() => { setStatus('IDLE'); setFile(null); }} className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl border border-emerald-400 hover:bg-emerald-700 transition-colors">
                    Importar Outra Nota
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
                <div className="bg-white p-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500"><Package size={20} /></div>
                    <h3 className="font-black text-gray-900">Resumo da Operação</h3>
                  </div>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100">
                    {relatorio.sucesso.length} itens recebidos
                  </span>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Produto no Sistema</th>
                        <th className="px-6 py-3 text-center">Código Lido</th>
                        <th className="px-6 py-3 text-center">Qtd. Nota</th>
                        <th className="px-6 py-3 text-center">Entrada Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {relatorio.sucesso.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">{item.nome}</td>
                          <td className="px-6 py-4 text-center font-mono text-gray-500">{item.ean}</td>
                          <td className="px-6 py-4 text-center text-gray-600">{item.qtdNota} un</td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                              + {item.entradaReal} un
                            </span>
                            {item.isCaixaFechada && <span className="block text-[10px] text-emerald-500 mt-1.5 font-bold uppercase">Fator x Aplicado</span>}
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