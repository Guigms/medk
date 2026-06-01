'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, UploadCloud, AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';

export default function ImportarProdutosPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; importedCount: number; errors: string[] } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls' && fileExtension !== 'csv') {
        setErrorMessage('Formato inválido. Por favor, envie um arquivo Excel (.xlsx, .xls) ou .csv');
        setFile(null);
        return;
      }
      
      setErrorMessage('');
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setErrorMessage('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha no processamento do arquivo.');
      }

      setResult(data);
      setFile(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar importação da planilha.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground p-4 md:p-8 transition-colors duration-300">
        
        {/* CABEÇALHO PADRONIZADO COM BOTÃO DE VOLTAR */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 hover:border-[#253289] dark:hover:border-blue-500 rounded-xl shadow-sm transition-all group cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Importação Completa</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Alimente ou atualize sua base de dados usando planilhas Excel.</p>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8">
          
          {/* GUIA DE ESTRUTURA DO MODELO EXCEL */}
          <div className="p-6 bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-100 dark:border-blue-900/30 rounded-3xl transition-colors">
            <h2 className="text-sm font-black text-[#253289] dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileSpreadsheet size={18} /> Modelo Obrigatório de Colunas
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 font-medium leading-relaxed">
              A primeira linha da sua planilha (cabeçalho) deve conter **exatamente** os nomes das colunas abaixo, escritos em letras minúsculas:
            </p>
            
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <table className="w-full text-left text-[11px] font-mono bg-white dark:bg-gray-950 border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 font-bold">
                    <th className="p-2.5 whitespace-nowrap">nome</th>
                    <th className="p-2.5 whitespace-nowrap">categoria</th>
                    <th className="p-2.5 whitespace-nowrap">marca</th>
                    <th className="p-2.5 whitespace-nowrap">preço venda</th>
                    <th className="p-2.5 whitespace-nowrap">estoque inicial</th>
                    <th className="p-2.5 whitespace-nowrap">descriçao</th>
                    <th className="p-2.5 whitespace-nowrap">link para imagem</th>
                    <th className="p-2.5 whitespace-nowrap">ean 13</th>
                    <th className="p-2.5 whitespace-nowrap">dun14</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-gray-700 dark:text-gray-300">
                    <td className="p-2.5 font-bold whitespace-nowrap">Paracetamol 750mg</td>
                    <td className="p-2.5 text-blue-600 dark:text-blue-400 whitespace-nowrap">analgesicos</td>
                    <td className="p-2.5 whitespace-nowrap">Medley</td>
                    <td className="p-2.5 whitespace-nowrap">12.90</td>
                    <td className="p-2.5 text-center whitespace-nowrap">50</td>
                    <td className="p-2.5 max-w-[120px] truncate whitespace-nowrap">Uso adulto para dor...</td>
                    <td className="p-2.5 text-gray-400 whitespace-nowrap">https://...</td>
                    <td className="p-2.5 whitespace-nowrap">7891234567890</td>
                    <td className="p-2.5 whitespace-nowrap">17891234567897</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-medium">
              * Nota 1: A coluna <strong className="font-bold">categoria</strong> deve corresponder exatamente ao slug da categoria cadastrada no seu banco (ex: "analgesicos", "suplementos").
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium">
              * Nota 2: O sistema aceita a escrita tanto como <strong className="font-bold">descriçao</strong> quanto <strong className="font-bold">descrição</strong> para prevenir erros de digitação.
            </p>
          </div>

          {/* ÁREA DE DROPA / SELEÇÃO DE ARQUIVO */}
          <form onSubmit={handleImport} className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 text-center shadow-sm transition-colors">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center relative group transition-colors">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={uploading}
              />
              <UploadCloud size={48} className="text-gray-400 dark:text-gray-500 mb-3 group-hover:text-[#253289] dark:group-hover:text-blue-400 transition-colors" />
              
              {file ? (
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Arraste a sua planilha atualizada ou clique para buscar</p>
                  <p className="text-xs text-gray-400 mt-1">Formatos suportados: Excel (.xlsx, .xls) ou CSV</p>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/30">
                <AlertCircle size={16} /> {errorMessage}
              </div>
            )}

            {/* RELATÓRIO DO HISTÓRICO DE PROCESSAMENTO */}
            {result && (
              <div className="mt-6 text-left p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl transition-colors">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase tracking-wide mb-2">
                  <CheckCircle2 size={18} /> Carga Finalizada com Sucesso!
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-bold">
                  📦 <span className="text-emerald-600 dark:text-emerald-400 font-black">{result.importedCount}</span> produtos foram inseridos ou atualizados via Upsert (EAN 13).
                </p>
                
                {result.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">Linhas Ignoradas ou com Alertas ({result.errors.length}):</p>
                    <ul className="text-[11px] text-gray-500 dark:text-gray-400 font-mono space-y-1 max-h-32 overflow-y-auto divide-y dark:divide-gray-800">
                      {result.errors.map((err, i) => (
                        <li key={i} className="py-1">{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={!file || uploading}
                className="flex-[2] bg-[#253289] dark:bg-blue-600 text-white py-4 rounded-xl font-black text-sm shadow-md hover:bg-[#1a2461] dark:hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {uploading ? 'Processando Base de Dados...' : '⚡ Iniciar Importação de Produtos'}
              </button>
              <Link
                href="/admin/produtos"
                className="flex-1 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-4 rounded-xl font-bold text-center border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center cursor-pointer"
              >
                Cancelar
              </Link>
            </div>
          </form>

        </div>
      </div>
    </ProtectedRoute>
  );
}