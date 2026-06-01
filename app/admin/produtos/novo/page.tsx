'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, LogOut } from 'lucide-react';

// Interfaces de Tipagem
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormData {
  name: string;
  brand: string;
  description: string;
  price: string;
  image: string;
  categoryId: string;
  available: boolean;
  featured: boolean;
  discount: string;
  requiresPrescription: boolean;
  stock: string;
  barcode: string; 
  purchaseBarcode: string;
  conversionFactor: string;
}

const INITIAL_FORM_STATE: ProductFormData = {
  name: '',
  brand: '',
  description: '',
  price: '',
  image: '',
  categoryId: '',
  available: true,
  featured: false,
  discount: '',
  requiresPrescription: false,
  stock: '',
  barcode: '', 
  purchaseBarcode: '',
  conversionFactor: '1',
};

export default function NovoProductPage() {
  const { logout } = useAuth();
  const router = useRouter();
  
  // Estados
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_STATE);

  // Carregar categorias com tratamento de erro
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Falha ao carregar categorias');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError('Não foi possível carregar as categorias. Recarregue a página.');
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validação básica de preço
    const priceValue = parseFloat(formData.price.replace(',', '.'));
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Por favor, insira um preço válido.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: priceValue,
          brand: formData.brand || null,
          barcode: formData.barcode || null, 
          purchaseBarcode: formData.purchaseBarcode || null, 
          conversionFactor: parseInt(formData.conversionFactor) || 1, 
          discount: formData.discount ? parseInt(formData.discount) : null,
          stock: formData.stock ? parseInt(formData.stock) : 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Erro ao criar produto');
      }

      setSuccess('Produto criado com sucesso! Redirecionando...');
      setFormData(INITIAL_FORM_STATE);

      const timer = setTimeout(() => {
        router.push('/admin/produtos');
      }, 2000);

      return () => clearTimeout(timer);

    } catch (err: any) {
      setError(err.message || 'Erro ao criar produto. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
        
        {/* CABEÇALHO PADRONIZADO COM BOTÃO DE VOLTAR */}
        <header className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()} 
                className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition-all border border-gray-100 dark:border-gray-700 flex items-center group cursor-pointer"
                title="Voltar"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">Adicionar Novo Produto</h1>
                <p className="hidden md:block text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">Lançamento de Inventário Comercial MedK</p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-xl border border-red-100 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/60 font-bold transition-colors text-sm flex items-center gap-1 cursor-pointer"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            
            {/* ALERTAS */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 shadow-sm border dark:border-red-900/30">
                <p className="font-black text-sm uppercase tracking-wide">Erro</p>
                <p className="text-sm mt-0.5 font-medium">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-400 p-4 rounded-xl mb-6 shadow-sm border dark:border-green-900/30">
                <p className="font-black text-sm uppercase tracking-wide">Sucesso!</p>
                <p className="text-sm mt-0.5 font-medium">{success}</p>
              </div>
            )}

            {/* FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8 space-y-8 transition-colors">
              
              {/* SEÇÃO 1: INFORMAÇÕES COMERCIAIS */}
              <section>
                <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-[#253289] dark:text-blue-400 rounded-lg text-xs font-black">01</span>
                  Informações Comerciais
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* BLOCO DE CÓDIGOS DE BARRAS E FATOR DE CONVERSÃO */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-950 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors">
                    <div>
                      <label htmlFor="barcode" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Cód. Venda (EAN-13)</label>
                      <input
                        id="barcode"
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-mono text-sm"
                        placeholder="Ex: 789..."
                        autoFocus
                      />
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium">Bipado no balcão (Unidade de Venda)</p>
                    </div>

                    <div>
                      <label htmlFor="purchaseBarcode" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Cód. NF (DUN-14)</label>
                      <input
                        id="purchaseBarcode"
                        type="text"
                        value={formData.purchaseBarcode}
                        onChange={(e) => setFormData({ ...formData, purchaseBarcode: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-mono text-sm"
                        placeholder="Ex: 1789..."
                      />
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium">Código da caixa master (Fornecedor)</p>
                    </div>

                    <div>
                      <label htmlFor="conversionFactor" className="block text-[10px] font-black text-[#253289] dark:text-blue-400 uppercase tracking-widest mb-1.5 ml-1">Fator de Conversão</label>
                      <input
                        id="conversionFactor"
                        type="number"
                        min="1"
                        required
                        value={formData.conversionFactor}
                        onChange={(e) => setFormData({ ...formData, conversionFactor: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-gray-700 rounded-xl focus:border-[#253289] dark:focus:border-blue-500 outline-none text-gray-900 dark:text-white font-black text-center text-sm"
                        placeholder="1"
                      />
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium">Unidades fracionadas dentro da caixa</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nome do Produto *</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold text-sm"
                      placeholder="Ex: Amoxicilina 500mg - 21 Cápsulas"
                    />
                  </div>

                  <div>
                    <label htmlFor="brand" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Marca / Laboratório</label>
                    <input
                      id="brand"
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm"
                      placeholder="Ex: Eurofarma"
                    />
                  </div>

                  <div>
                    <label htmlFor="categoryId" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Categoria *</label>
                    <select
                      id="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none text-gray-600 dark:text-gray-300 font-bold bg-white cursor-pointer text-sm"
                    >
                      <option value="">Selecione...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Preço de Venda (R$) *</label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none text-[#253289] dark:text-blue-400 font-black text-sm"
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <label htmlFor="stock" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Estoque Inicial (Unidades)</label>
                    <input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none text-blue-600 dark:text-blue-400 font-black text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </section>

              {/* SEÇÃO 2: DETALHES E IMAGEM */}
              <section>
                <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-[#253289] dark:text-blue-400 rounded-lg text-xs font-black">02</span>
                  Detalhes do Produto
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="description" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Descrição Completa *</label>
                    <textarea
                      id="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm"
                      placeholder="Indicações, contraindicações e modo de uso estruturado..."
                    />
                  </div>

                  <div>
                    <label htmlFor="image" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">URL da Imagem *</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="flex-1 w-full">
                        <input
                          id="image"
                          type="url"
                          required
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none text-xs font-mono text-gray-900 dark:text-white"
                          placeholder="https://exemplo.com/foto.jpg"
                        />
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 font-medium">Use links diretos estáticos de servidores de armazenamento ou imagens públicas.</p>
                      </div>
                      
                      {formData.image && (
                        <div className="shrink-0 mx-auto sm:mx-0">
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="w-24 h-24 object-cover rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 shadow-inner"
                            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/100?text=Erro'; }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* SEÇÃO 3: REGRAS DE NEGÓCIO */}
              <section>
                <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-[#253289] dark:text-blue-400 rounded-lg text-xs font-black">03</span>
                  Configurações e Regras
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="discount" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Desconto Promocional (%)</label>
                    <input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none font-bold text-red-500 dark:text-red-400 text-sm"
                      placeholder="Ex: 10"
                    />
                  </div>

                  <div className="flex flex-col justify-end space-y-3.5 py-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        className="w-5 h-5 text-[#253289] dark:text-blue-600 border-gray-300 dark:border-gray-700 rounded focus:ring-[#253289] bg-gray-50 dark:bg-gray-800"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Produto disponível para venda imediata</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-5 h-5 text-[#253289] dark:text-blue-600 border-gray-300 dark:border-gray-700 rounded focus:ring-[#253289] bg-gray-50 dark:bg-gray-800"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Destaque na vitrine da página inicial</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.requiresPrescription}
                        onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                        className="w-5 h-5 text-orange-500 border-gray-300 dark:border-gray-700 rounded focus:ring-orange-500 bg-gray-50 dark:bg-gray-800"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white font-black transition-colors">⚠️ REQUER RETENÇÃO DE RECEITA CONTROLADA</span>
                    </label>
                  </div>
                </div>
              </section>

              {/* PAINEL DE BOTÕES DE AÇÃO */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-[#253289] dark:bg-blue-600 text-white py-4 rounded-xl hover:bg-[#1a2461] dark:hover:bg-blue-700 transition-all font-black shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center cursor-pointer text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </span>
                  ) : '✓ Finalizar Cadastro'}
                </button>
                
                <Link
                  href="/admin/produtos"
                  className="flex-1 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold text-center border border-gray-200 dark:border-gray-700 text-sm flex items-center justify-center cursor-pointer"
                >
                  Cancelar e Sair
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}