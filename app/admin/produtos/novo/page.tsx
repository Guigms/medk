'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

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
          discount: formData.discount ? parseInt(formData.discount) : null,
          stock: formData.stock ? parseInt(formData.stock) : 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar produto');
      }

      setSuccess('Produto criado com sucesso! Redirecionando...');
      setFormData(INITIAL_FORM_STATE);

      // Timer com limpeza automática
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
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin/produtos" className="text-[#253289] hover:underline text-sm mb-1 inline-block">
                  ← Voltar para Lista de Produtos
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Adicionar Novo Produto</h1>
              </div>
              <button
                onClick={() => logout()}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors border border-red-200 font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Alerts */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 shadow-sm">
                <p className="font-bold">Erro</p>
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-6 shadow-sm">
                <p className="font-bold">Sucesso!</p>
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
              
              {/* Seção 1: Informações de Venda */}
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600 text-sm">01</span>
                  Informações Comerciais
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253289] outline-none text-gray-900"
                      placeholder="Ex: Amoxicilina 500mg - 21 Cápsulas"
                    />
                  </div>

                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Marca / Laboratório</label>
                    <input
                      id="brand"
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253289] outline-none text-gray-900"
                      placeholder="Ex: Eurofarma"
                    />
                  </div>

                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                    <select
                      id="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253289] outline-none text-gray-900 bg-white"
                    >
                      <option value="">Selecione...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda (R$) *</label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253289] outline-none text-gray-900"
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Estoque Inicial</label>
                    <input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253289] outline-none text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>
              </section>

              {/* Seção 2: Detalhes e Imagem */}
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600 text-sm">02</span>
                  Detalhes do Produto
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição Completa *</label>
                    <textarea
                      id="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253289] outline-none text-gray-900"
                      placeholder="Indicações, contraindicações e modo de uso..."
                    />
                  </div>

                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem *</label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <input
                          id="image"
                          type="url"
                          required
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253289] outline-none text-gray-900"
                          placeholder="https://exemplo.com/foto.jpg"
                        />
                        <p className="text-xs text-gray-500 mt-2">Dica: Use links diretos do Unsplash ou do seu servidor de imagens.</p>
                      </div>
                      
                      {formData.image && (
                        <div className="shrink-0">
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200 bg-gray-50"
                            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/100?text=Erro'; }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Seção 3: Regras de Negócio */}
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600 text-sm">03</span>
                  Configurações e Regras
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">Desconto Promocional (%)</label>
                    <input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253289] outline-none text-gray-900"
                      placeholder="Ex: 10"
                    />
                  </div>

                  <div className="flex flex-col justify-end space-y-3 py-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        className="w-5 h-5 text-[#253289] border-gray-300 rounded focus:ring-[#253289]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Produto disponível para venda</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-5 h-5 text-[#253289] border-gray-300 rounded focus:ring-[#253289]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Destaque na página inicial</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.requiresPrescription}
                        onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                        className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors font-medium text-orange-600">⚠️ Requer Retenção de Receita</span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#253289] text-white py-3.5 rounded-xl hover:bg-[#1a2461] transition-all font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
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
                  className="flex-1 bg-white text-gray-600 py-3.5 rounded-xl hover:bg-gray-50 transition-all font-semibold text-center border border-gray-200"
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