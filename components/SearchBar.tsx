'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Fecha as sugestões ao clicar fora do componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInputChange = async (value: string) => {
    setQuery(value);
    
    if (value.length > 2) {
      setIsLoading(true);
      try {
        // Busca os produtos reais da sua API
        const response = await fetch(`/api/products?q=${encodeURIComponent(value)}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setSuggestions(data.slice(0, 5));
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchTerm = query.trim();
    if (!searchTerm) return;

    if (onSearch) {
      onSearch(searchTerm);
    } else {
      // Redireciona para a página de produtos com o parâmetro 'q' (conforme ajustamos na API)
      router.push(`/produtos?q=${encodeURIComponent(searchTerm)}`);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Busque por medicamentos, higiene, suplementos..."
          className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-300 focus:border-[#253289] focus:outline-none text-gray-900 shadow-sm"
          data-testid="search-input"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#253289] text-white p-2 rounded-lg hover:bg-[#10BCEC] transition-colors"
          data-testid="search-button"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>

      {/* Sugestões Reais */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
          {suggestions.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                setQuery(product.name);
                router.push(`/produtos?q=${encodeURIComponent(product.name)}`);
                setShowSuggestions(false);
              }}
              className="w-full text-left block px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-center gap-3">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-10 h-10 object-cover rounded bg-gray-100"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0"></div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.category?.name}</div>
                </div>
                <div className="text-[#253289] font-bold text-sm">
                  R$ {Number(product.price).toFixed(2)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}