'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { 
  Trash2, Edit, Plus, LogOut, FileUp, ArrowLeft, Eye, EyeOff, Star, X, Save, Search, Filter 
} from 'lucide-react';

export const dynamic = 'force-dynamic'; // ⚡ Impede caches antigos e força dados frescos direto do MySQL

export default function ProdutosAdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para Modal de Edição Completa
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⚡ ATUALIZAÇÃO: Chave Mestra para liberar as ações
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || isSuperAdmin;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        // Puxa todo o inventário administrativo (ativos, ocultos e recém-importados)
        fetch('/api/admin/products'),
        fetch('/api/categories')
      ]);
      const productsData = await productsRes.json();
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];
      
      setProducts(Array.isArray(productsData) ? productsData : []);
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

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category?.slug === selectedCategory;
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                         (product.barcode || '').includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    if (!isAdmin) return; // ⚡ Agora o Super Admin passa por aqui
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
    }
  };

  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    if (!isAdmin) return; 
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
    }
  };

  const handleOpenEdit = (product: any) => {
    if (!isAdmin) return;
    setEditingProduct({
      ...product,
      categoryId: product.categoryId || '',
      price: String(product.price),
      discount: String(product.discount || 0),
      stock: String(product.stock || 0),
      conversionFactor: String(product.conversionFactor || 1)
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!isAdmin || !editingProduct) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingProduct,
          price: parseFloat(editingProduct.price),
          discount: parseInt(editingProduct.discount),
          stock: parseInt(editingProduct.stock),
          conversionFactor: parseInt(editingProduct.conversionFactor)
        })
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        fetchData();
      } else {
        alert("Erro ao atualizar produto.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!isAdmin) return;
    if (confirm('Deseja excluir este produto permanentemente?')) {
      const response = await fetch('/api/admin/products', { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRole: user?.role, productId })
      });
      if (response.ok) fetchData();
    }
  };

  if (loading) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-bold text-[#253289] dark:text-blue-400">Carregando catálogo...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
        
        {/* HEADER COM SUPORTE DARK */}
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
                <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight flex items-center gap-2">
                  Produtos
                  {isSuperAdmin && (
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest flex items-center shadow-sm border border-emerald-200 dark:border-emerald-800">
                      Master
                    </span>
                  )}
                </h1>
                <p className="hidden md:block text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">Gestão de Inventário MedK</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* ⚡ ATUALIZAÇÃO: Se for isAdmin (que inclui o SuperAdmin), mostra os botões de ação */}
              {isAdmin && (
                <>
                  <Link 
                    href="/admin/import-xml" 
                    className="bg-blue-50 dark:bg-blue-950/40 text-[#253289] dark:text-blue-400 px-4 py-2.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all font-bold flex items-center gap-2 border border-blue-100 dark:border-blue-900/30 text-sm"
                  >
                    <FileUp size={18} />
                    <span className="hidden sm:inline">Importar XML</span>
                  </Link>

                  <Link 
                    href="/admin/produtos/novo" 
                    className="bg-[#25D366] text-white px-4 py-2.5 rounded-xl hover:bg-[#1ebe57] transition-all font-bold flex items-center gap-2 shadow-lg shadow-green-100 dark:shadow-none text-sm"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Novo Produto</span>
                  </Link>
                </>
              )}
              <button onClick={() => logout()} className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-2.5 rounded-xl border border-red-100 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors cursor-pointer" title="Sair do Sistema">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          
          {/* FILTROS INTEGRADOS */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-5 mb-8 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 transition-colors">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Pesquisar por nome ou EAN..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none font-medium text-gray-900 dark:text-white" 
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-gray-400 dark:text-gray-500 hidden md:block" />
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)} 
                className="md:w-64 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          {/* TABELA DE PRODUTOS */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-950 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="py-5 px-6">Produto</th>
                    <th className="py-5 px-6">Categoria</th>
                    <th className="py-5 px-6 text-center">Estoque</th>
                    <th className="py-5 px-6 text-center">Status</th>
                    <th className="py-5 px-6 text-center">Destaque</th>
                    <th className="py-5 px-6 text-right">Preço</th>
                    {isAdmin && <th className="py-5 px-6 text-center">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 flex items-center justify-center shadow-inner relative">
                            {/* 🌟 GESTÃO INTEGRAL DA IMAGEM: Tratamento para erro 400, 403 e correção de cache redundante */}
                            {product.image && product.image !== 'null' && product.image !== 'undefined' ? (
                              <img 
                                src={encodeURI(product.image.trim())} 
                                className="w-full h-full object-cover" 
                                alt={product.name} 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<span class="text-xl">💊</span>';
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-xl">💊</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">{product.name}</div>
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">EAN: {product.barcode || '---'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 font-medium">{product.category?.name}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${product.stock > 0 ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'}`}>
                          {product.stock} un
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleAvailability(product.id, product.available)}
                          disabled={!isAdmin}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                            product.available 
                              ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/40' 
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700'
                          } ${isAdmin ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}
                        >
                          {product.available ? <Eye size={12} /> : <EyeOff size={12} />}
                          {product.available ? 'Ativo' : 'Oculto'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleFeatured(product.id, product.featured)}
                          disabled={!isAdmin}
                          className={`p-2 rounded-xl transition-all ${
                            product.featured ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40' : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'
                          } ${isAdmin ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                        >
                          <Star size={18} fill={product.featured ? "currentColor" : "none"} />
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-[#253289] dark:text-blue-400">{formatPrice(product.price)}</td>
                      {isAdmin && (
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleOpenEdit(product)} className="p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-900/30 transition-colors cursor-pointer" title="Editar"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30 transition-colors cursor-pointer" title="Excluir"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProducts.length === 0 && (
              <div className="p-12 text-center text-gray-400 dark:text-gray-500 font-medium italic">Nenhum produto encontrado com os filtros atuais.</div>
            )}
          </div>
        </main>

        {/* MODAL DE EDIÇÃO COMPLETA */}
        {isEditModalOpen && editingProduct && (
          <div className="fixed inset-0 bg-[#253289]/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-white/20 dark:border-gray-800">
              
              <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#253289] dark:bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 dark:shadow-none">
                    <Edit size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Editar Produto</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Atualize os detalhes comerciais e de estoque</p>
                  </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all cursor-pointer">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 dark:bg-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nome do Produto</label>
                    <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none font-bold text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Marca / Laboratório</label>
                    <input type="text" value={editingProduct.brand || ''} onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Categoria</label>
                    <select value={editingProduct.categoryId} onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-600 dark:text-gray-300">
                      <option value="">Selecione...</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-blue-50/50 dark:bg-gray-950 rounded-3xl border border-blue-100/50 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-inner">
                  <div>
                    <label className="block text-[11px] font-black text-[#253289] dark:text-blue-400 uppercase tracking-widest mb-1.5">Código de Venda (EAN)</label>
                    <input type="text" value={editingProduct.barcode || ''} onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-blue-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none font-mono font-bold text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#253289] dark:text-blue-400 uppercase tracking-widest mb-1.5">Código de Compra (DUN)</label>
                    <input type="text" value={editingProduct.purchaseBarcode || ''} onChange={(e) => setEditingProduct({ ...editingProduct, purchaseBarcode: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-blue-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none font-mono font-bold text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#253289] dark:text-blue-400 uppercase tracking-widest mb-1.5">Fator de Conversão</label>
                    <input type="number" value={editingProduct.conversionFactor} onChange={(e) => setEditingProduct({ ...editingProduct, conversionFactor: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none font-black text-center text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Preço (R$)</label>
                    <input type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none font-black text-[#253289] dark:text-blue-400" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Desconto (%)</label>
                    <input type="number" value={editingProduct.discount} onChange={(e) => setEditingProduct({ ...editingProduct, discount: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#253289] dark:focus:ring-blue-500 outline-none font-bold text-red-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Estoque Físico</label>
                    <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-black text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">URL da Imagem</label>
                  <input type="url" value={editingProduct.image} onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-mono text-gray-900 dark:text-white" placeholder="https://..." />
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 flex gap-4">
                <button onClick={handleSaveEdit} disabled={isSubmitting} className="flex-[2] bg-[#253289] dark:bg-blue-600 text-white py-4 rounded-2xl hover:bg-[#1a2461] dark:hover:bg-blue-700 transition-all font-black shadow-lg shadow-blue-200 dark:shadow-none flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer">
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={20}/> Salvar Alterações</>}
                </button>
                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-bold border border-gray-200 dark:border-gray-700 text-sm cursor-pointer">
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