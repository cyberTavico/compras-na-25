'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  description?: string;
  prices: Price[];
}

interface Price {
  id: string;
  price: number;
  url: string;
  store: {
    id: string;
    name: string;
  };
}

export default function ComparisonDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`
      );
      setProducts(response.data);
    } catch (err) {
      setError('Erro ao carregar produtos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLowestPrice = (prices: Price[]) => {
    if (!prices.length) return null;
    return prices.reduce((lowest, current) =>
      current.price < lowest.price ? current : lowest
    );
  };

  const getHighestPrice = (prices: Price[]) => {
    if (!prices.length) return null;
    return prices.reduce((highest, current) =>
      current.price > highest.price ? current : highest
    );
  };

  const calculateSavings = (prices: Price[]) => {
    const lowest = getLowestPrice(prices);
    const highest = getHighestPrice(prices);
    if (!lowest || !highest) return 0;
    return highest.price - lowest.price;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-2">💰 Comparador de Preços</h1>
          <p className="text-blue-100">Encontre as melhores ofertas em tempo real</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Products List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Produtos</h2>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {products.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      Nenhum produto encontrado
                    </div>
                  ) : (
                    products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`w-full text-left p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                          selectedProduct?.id === product.id ? 'bg-blue-100' : ''
                        }`}
                      >
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {product.name}
                        </p>
                        {product.prices.length > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            R$ {getLowestPrice(product.prices)?.price.toFixed(2)}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:col-span-3">
              {selectedProduct ? (
                <div className="space-y-6">
                  {/* Product Info */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {selectedProduct.name}
                        </h2>
                        {selectedProduct.description && (
                          <p className="text-gray-600 mt-2">
                            {selectedProduct.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price Stats */}
                    {selectedProduct.prices.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">Menor Preço</p>
                          <p className="text-2xl font-bold text-green-600 mt-1">
                            R$ {getLowestPrice(selectedProduct.prices)?.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getLowestPrice(selectedProduct.prices)?.store.name}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">Maior Preço</p>
                          <p className="text-2xl font-bold text-red-600 mt-1">
                            R$ {getHighestPrice(selectedProduct.prices)?.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getHighestPrice(selectedProduct.prices)?.store.name}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">Economia</p>
                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            R$ {calculateSavings(selectedProduct.prices).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedProduct.prices.length} lojas
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price Comparison Table */}
                  {selectedProduct.prices.length > 0 ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Comparação de Preços
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                                Loja
                              </th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                                Preço
                              </th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                                Diferença
                              </th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                                Ação
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProduct.prices
                              .sort((a, b) => a.price - b.price)
                              .map((price) => {
                                const lowestPrice = getLowestPrice(
                                  selectedProduct.prices
                                )?.price || 0;
                                const difference = price.price - lowestPrice;

                                return (
                                  <tr
                                    key={price.id}
                                    className="border-t border-gray-200 hover:bg-gray-50"
                                  >
                                    <td className="px-6 py-4">
                                      <span className="font-medium text-gray-800">
                                        {price.store.name}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="text-lg font-semibold text-gray-900">
                                        R$ {price.price.toFixed(2)}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      {difference === 0 ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                          Melhor preço
                                        </span>
                                      ) : (
                                        <span className="text-red-600 font-medium">
                                          +R$ {difference.toFixed(2)}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <a
                                        href={price.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                      >
                                        Ver Oferta →
                                      </a>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                      Nenhum preço disponível para este produto
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-500 text-lg">👈 Selecione um produto para ver a comparação</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
