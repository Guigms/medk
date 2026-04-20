'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';

export default function ProdutosAdminPage() {
  const { logout } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Busca inicial de Produtos e Categorias na API real
  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories') // Vamos assumir que você tem ou criará essa rota, caso contrário, avise!
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

  // Toggle Disponibilidade (Conectado à API)
  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Otimista: atualiza a tela antes da resposta da API
    setProducts(products.map(p => p.id === productId ? { ...p, available: newStatus } : p));
    
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newStatus })
      });
    } catch (error) {
      // Reverte se der erro
      setProducts(products.map(p => p.id === productId ? { ...p, available: currentStatus } : p));
      alert("Erro ao atualizar disponibilidade.");
    }
  };

  // Toggle Destaque (Conectado à API)
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

  // Salvar Edição (Conectado à API)
  const handleSave = async () => {
    if (!editingProduct) return;
    
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT', // ou PATCH, dependendo de como você montou a rota de edição
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          discount: editingProduct.discount,
          categoryId: editingProduct.categoryId,
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchData(); // Recarrega os dados fresquinhos do banco
      } else {
        alert("Erro ao salvar produto.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Excluir Produto (Conectado à API)
  const handleDelete = async (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto do banco de dados?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setProducts(products.filter(p => p.id !== productId));
        } else {
           alert("Erro: O produto não pode ser excluído. Pode estar vinculado a um pedido existente.");
        }
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 p-8 text-center text-[#253289] font-bold">Carregando painel de produtos...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin/dashboard" className="text-[#253289] hover:text-[#1a2461] text-sm mb-1 inline-block">
                  ← Voltar ao Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gerenciar Produtos
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                <Link 
                  href="/admin/produtos/novo"
                  className="bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#1ebe57] transition-colors font-bold flex items-center gap-2 shadow-sm"
                >
                  <span className="text-lg">＋</span> Novo Produto
                </Link>
                <button
                  onClick={() => logout()}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Produto</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite o nome do produto..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253289] text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Categoria</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253289] text-gray-900"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-4 text-gray-600 font-medium">Produto</th>
                    <th className="text-left py-4 px-4 text-gray-600 font-medium">Categoria</th>
                    <th className="text-left py-4 px-4 text-gray-600 font-medium">Preço</th>
                    <th className="text-center py-4 px-4 text-gray-600 font-medium">Disponível</th>
                    <th className="text-center py-4 px-4 text-gray-600 font-medium">Destaque</th>
                    <th className="text-center py-4 px-4 text-gray-600 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden relative flex-shrink-0">
                               <img src={product.image} alt="" className="object-cover w-full h-full" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900">{product.name}</div>
                            {product.requiresPrescription && (
                              <span className="text-[10px] bg-red-100 text-red-700 px-2 rounded-full font-bold">Rx - Receita</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {product.category?.name || 'Sem Categoria'}
                      </td>
                      <td className="py-4 px-4 text-[#253289] font-bold">
                        {formatPrice(Number(product.price))}
                        {product.discount > 0 && (
                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded">
                            -{product.discount}%
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleAvailability(product.id, product.available)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            product.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {product.available ? 'Online' : 'Oculto'}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleFeatured(product.id, product.featured)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            product.featured ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {product.featured ? '⭐ Destaque' : 'Normal'}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors text-xs font-bold border border-blue-200"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition-colors text-xs font-bold border border-red-200"
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-gray-50 text-gray-500">
                Nenhum produto encontrado com os filtros atuais.
              </div>
            )}
          </div>
        </main>

        {/* Modal de Edição */}
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
              <h2 className="text-2xl font-black mb-6 text-[#253289]">Editar Produto</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Desconto (%)</label>
                    <input
                      type="number"
                      value={editingProduct.discount || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, discount: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-[#253289] text-white py-3 rounded-xl hover:bg-[#1a2461] transition-colors font-bold shadow-md"
                >
                  Salvar Alterações
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-bold"
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