'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { 
  Trash2, Edit, Plus, LogOut, LayoutDashboard, 
  PackagePlus, X, Save, FileUp, ArrowLeft, Eye, EyeOff, Star 
} from 'lucide-react';

export default function ProdutosAdminPage() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para Modal de Edição Completa
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Estados para Entrada de Estoque Rápida
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<any | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<number | ''>('');
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  const fetchData = async () => {
    try {
      setLoading(true);
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

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category?.slug === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    if (!isAdmin) return;
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

  const handleAddStock = async () => {
    if (!stockProduct || !quantityToAdd || quantityToAdd <= 0) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/products/${stockProduct.id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantityToAdd: Number(quantityToAdd) })
      });
      if (response.ok) {
        setStockModalOpen(false);
        fetchData();
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
      const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#253289]"></div></div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 pb-20">
        
        {/* HEADER */}
        <header className="bg-white shadow-md border-b sticky top-0 z-30">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/dashboard" 
                className="p-2.5 bg-gray-50 text-gray-500 hover:text-[#253289] hover:bg-blue-50 rounded-xl transition-all border border-gray-100 flex items-center gap-2 font-bold text-sm"
              >
                <ArrowLeft size={20} />
                <span className="hidden md:inline">Painel</span>
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-tight">Produtos</h1>
                <p className="hidden md:block text-[10px] text-gray-400 font-bold uppercase tracking-widest">Controle de Inventário</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {isAdmin && (
                <>
                  <Link 
                    href="/admin/import-xml" 
                    className="bg-blue-50 text-[#253289] px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-all font-bold flex items-center gap-2 border border-blue-100"
                  >
                    <FileUp size={20} />
                    <span className="hidden sm:inline">Importar XML</span>
                  </Link>

                  <Link 
                    href="/admin/produtos/novo" 
                    className="bg-[#25D366] text-white px-4 py-2.5 rounded-xl hover:bg-[#1ebe57] transition-all font-bold flex items-center gap-2 shadow-lg shadow-green-100"
                  >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Novo Produto</span>
                  </Link>
                </>
              )}
              <button onClick={() => logout()} className="bg-red-50 text-red-600 p-2.5 rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          
          {/* FILTROS */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Pesquisar por nome ou código..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none" />
              <div className="absolute left-3 top-3.5 text-gray-400">🔍</div>
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="md:w-64 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none">
              <option value="all">Todas as Categorias</option>
              {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
            </select>
          </div>

          {/* TABELA DE PRODUTOS */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[11px] font-black text-gray-500 uppercase tracking-widest border-b">
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
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <span className="text-xl">💊</span>}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 leading-tight">{product.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">EAN: {product.barcode || '---'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-medium">{product.category?.name}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${product.stock > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                          {product.stock} un
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleAvailability(product.id, product.available)}
                          disabled={!isAdmin}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                            product.available 
                              ? 'bg-green-50 text-green-600 border border-green-100' 
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
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
                            product.featured ? 'text-amber-500 bg-amber-50 border border-amber-100' : 'text-gray-300 hover:text-amber-300'
                          } ${isAdmin ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                        >
                          <Star size={18} fill={product.featured ? "currentColor" : "none"} />
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-[#253289]">{formatPrice(product.price)}</td>
                      {isAdmin && (
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleOpenEdit(product)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-100"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* MODAL DE EDIÇÃO COMPLETA */}
        {isEditModalOpen && editingProduct && (
          <div className="fixed inset-0 bg-[#253289]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
              
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#253289] text-white rounded-2xl shadow-lg shadow-blue-100">
                    <Edit size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Editar Produto</h2>
                    <p className="text-sm text-gray-500 font-medium">Atualize os detalhes comerciais e de estoque</p>
                  </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-2xl shadow-sm border border-gray-100 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Seção 1: Dados Básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome do Produto</label>
                    <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#253289] outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Marca / Laboratório</label>
                    <input type="text" value={editingProduct.brand || ''} onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#253289] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Categoria</label>
                    <select value={editingProduct.categoryId} onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none">
                      <option value="">Selecione...</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Seção 2: Códigos e Estoque */}
                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-[#253289] uppercase tracking-widest mb-1.5">Código de Venda (EAN)</label>
                    <input type="text" value={editingProduct.barcode || ''} onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })} className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#253289] uppercase tracking-widest mb-1.5">Código de Compra (DUN)</label>
                    <input type="text" value={editingProduct.purchaseBarcode || ''} onChange={(e) => setEditingProduct({ ...editingProduct, purchaseBarcode: e.target.value })} className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#253289] uppercase tracking-widest mb-1.5">Fator de Conversão</label>
                    <input type="number" value={editingProduct.conversionFactor} onChange={(e) => setEditingProduct({ ...editingProduct, conversionFactor: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none font-black text-center" />
                  </div>
                </div>

                {/* Seção 3: Preço e Foto */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Preço (R$)</label>
                    <input type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#253289] outline-none font-black text-[#253289]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Desconto (%)</label>
                    <input type="number" value={editingProduct.discount} onChange={(e) => setEditingProduct({ ...editingProduct, discount: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#253289] outline-none font-bold text-red-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Estoque Físico</label>
                    <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-black" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">URL da Imagem</label>
                  <input type="url" value={editingProduct.image} onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono" />
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                <button onClick={handleSaveEdit} disabled={isSubmitting} className="flex-2 bg-[#253289] text-white py-4 rounded-2xl hover:bg-[#1a2461] transition-all font-black shadow-lg shadow-blue-200 flex justify-center items-center gap-2">
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={20}/> Salvar Alterações</>}
                </button>
                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-white text-gray-500 py-4 rounded-2xl hover:bg-gray-100 transition-all font-bold border border-gray-200 text-sm">
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