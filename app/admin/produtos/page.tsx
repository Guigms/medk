'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { Trash2, Edit, Plus, LogOut, LayoutDashboard, Eye, EyeOff, Star } from 'lucide-react';

export default function ProdutosAdminPage() {
  const { logout } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Busca inicial de Produtos e Categorias
  const fetchData = async () => {
    try {
      setLoading(true);
      // 🌟 CORREÇÃO: Enviando adminView=true para ignorar o filtro de 'available: true' no banco
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?adminView=true'),
        fetch('/api/categories')
      ]);
      const productsData = await productsRes.json();
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lógica de Filtro local
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category?.slug === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Toggle Disponibilidade
  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setProducts(products.map(p => p.id === productId ? { ...p, available: newStatus } : p));
    
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newStatus })
      });
    } catch (error) {
      setProducts(products.map(p => p.id === productId ? { ...p, available: currentStatus } : p));
      alert("Erro ao atualizar disponibilidade.");
    }
  };

  // Toggle Destaque
  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setProducts(products.map(p => p.id === productId ? { ...p, featured: newStatus } : p));
    
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: newStatus })
      });
    } catch (error) {
      setProducts(products.map(p => p.id === productId ? { ...p, featured: currentStatus } : p));
      alert("Erro ao atualizar destaque.");
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct({ ...product, categoryId: product.category?.id || '' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          price: Number(editingProduct.price),
          discount: parseInt(editingProduct.discount) || 0,
          categoryId: editingProduct.categoryId,
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchData();
      } else {
        alert("Erro ao salvar produto.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto permanentemente?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setProducts(products.filter(p => p.id !== productId));
        } else {
           alert("Erro: O produto não pode ser excluído (pode estar em um pedido).");
        }
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#253289]"></div>
          <p className="text-[#253289] font-bold">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-md border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex flex-col">
              <Link href="/admin/dashboard" className="text-[#253289] hover:underline text-xs flex items-center gap-1 mb-1">
                <LayoutDashboard size={14} /> Painel Administrativo
              </Link>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Gerenciar Produtos</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/admin/produtos/novo" className="bg-[#25D366] text-white px-5 py-2.5 rounded-xl hover:bg-[#1ebe57] transition-all font-bold flex items-center gap-2 shadow-lg shadow-green-200">
                <Plus size={20} /> Novo Produto
              </Link>
              <button onClick={() => logout()} className="bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-100 transition-colors border border-red-200">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Filtros */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome ou laboratório..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none"
              />
              <div className="absolute left-3 top-3.5 text-gray-400">🔍</div>
            </div>
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-[11px] font-black tracking-widest">
                  <tr>
                    <th className="py-5 px-6">Produto / Ref</th>
                    <th className="py-5 px-6">Categoria</th>
                    <th className="py-5 px-6 text-center">Status</th>
                    <th className="py-5 px-6 text-center">Destaque</th>
                    <th className="py-5 px-6 text-right">Preço</th>
                    <th className="py-5 px-6 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${!product.available ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-200 flex-shrink-0 flex items-center justify-center">
                             {product.image ? (
                               <img src={product.image} alt="" className="object-cover w-full h-full" />
                             ) : (
                               <span className="text-xl">💊</span>
                             )}
                          </div>
                          <div>
                            <div className={`font-bold text-gray-900 ${!product.available ? 'text-gray-400 italic' : ''}`}>
                              {product.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {product.id.slice(-6)}</div>
                            {product.requiresPrescription && (
                              <span className="mt-1 inline-block text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black uppercase">⚠️ Receita</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-sm font-medium text-gray-600">{product.category?.name || '---'}</span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <button
                          onClick={() => toggleAvailability(product.id, product.available)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${
                            product.available 
                              ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          {product.available ? <Eye size={12} /> : <EyeOff size={12} />}
                          {product.available ? 'Ativo' : 'Oculto'}
                        </button>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <button
                          onClick={() => toggleFeatured(product.id, product.featured)}
                          className={`p-2 rounded-xl transition-all ${
                            product.featured ? 'text-amber-500 bg-amber-50 border border-amber-200' : 'text-gray-300 hover:text-gray-400 bg-gray-50'
                          }`}
                        >
                          <Star size={18} fill={product.featured ? "currentColor" : "none"} />
                        </button>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="font-black text-[#253289]">{formatPrice(Number(product.price))}</div>
                        {product.discount > 0 && (
                          <div className="text-[10px] text-red-500 font-bold">-{product.discount}% OFF</div>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(product)} className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 border border-blue-100 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2.5 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 border border-red-100 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-24 bg-gray-50 text-gray-400">
                <div className="text-4xl mb-4">📦</div>
                <p className="font-medium">Nenhum produto encontrado.</p>
              </div>
            )}
          </div>
        </main>

        {/* Modal de Edição (Design Melhorado) */}
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 bg-[#253289]/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-black mb-8 text-[#253289] flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg"><Edit size={24}/></div>
                Editar Produto
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome Comercial</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#253289] outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#253289] outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Desconto (%)</label>
                    <input
                      type="number"
                      value={editingProduct.discount || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, discount: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#253289] outline-none font-bold text-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Categoria de Saúde</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#253289] outline-none font-medium appearance-none"
                  >
                    <option value="">Vincular categoria...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button
                  onClick={handleSave}
                  className="flex-[2] bg-[#253289] text-white py-4 rounded-2xl hover:bg-[#1a2461] transition-all font-black shadow-lg shadow-blue-200"
                >
                  Salvar Alterações
                </button>
                <button
                  onClick={() => { setIsModalOpen(false); setEditingProduct(null); }}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl hover:bg-gray-200 transition-all font-bold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}