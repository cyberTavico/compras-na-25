import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description?: string;
  prices: any[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const endpoint = searchTerm
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/products/search?q=${searchTerm}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/products`;

      const response = await axios.get(endpoint);
      setProducts(response.data);
    } catch (err) {
      setError('Erro ao carregar produtos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const getLowestPrice = (prices: any[]) => {
    if (!prices.length) return null;
    return prices.reduce((lowest, current) =>
      current.price < lowest.price ? current : lowest
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold">🛍️ Compras na 25</h1>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
              >
                Dashboard
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/notifications"
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
                  >
                    🔔 Notificações
                  </Link>
                  <Link
                    href="/price-alerts"
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
                  >
                    🚨 Alertas
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      setIsAuthenticated(false);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                  >
                    Registrar
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar produtos (notebook, smartphone, fone...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded text-gray-800"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-700 hover:bg-blue-600 rounded font-semibold transition-colors"
            >
              Buscar
            </button>
          </form>
          <p className="text-blue-100 text-sm mt-2">Agregador de preços de compras - Encontre as melhores ofertas</p>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Nenhum produto encontrado</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Mostrando {products.length} produto{products.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const lowestPrice = getLowestPrice(product.prices);
                    return (
                      <Link key={product.id} href="/dashboard">
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                          <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                            {product.name}
                          </h2>
                          {product.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {product.description}
                            </p>
                          )}

                          {lowestPrice ? (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-gray-500 text-sm">Menor preço</p>
                              <p className="text-2xl font-bold text-green-600">
                                R$ {lowestPrice.price.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                em {lowestPrice.store.name}
                              </p>
                              {product.prices.length > 1 && (
                                <p className="text-xs text-blue-600 mt-2">
                                  +{product.prices.length - 1} outra{' '}
                                  {product.prices.length > 2 ? 'lojas' : 'loja'}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm mt-4">Preço indisponível</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
