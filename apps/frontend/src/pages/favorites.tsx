'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  prices: {
    id: string;
    price: number;
    store: {
      name: string;
    };
  }[];
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
      fetchFavorites(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
    } catch (err) {
      console.error('Erro ao carregar usuário');
    }
  };

  const fetchFavorites = async (token: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/favorites`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFavorites(response.data);
    } catch (err) {
      setError('Erro ao carregar favoritos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFavorites((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Erro ao remover favorito');
    }
  };

  const getLowestPrice = (prices: any[]) => {
    if (!prices.length) return null;
    return prices.reduce((lowest, current) =>
      current.price < lowest.price ? current : lowest
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Você precisa fazer login para ver seus favoritos</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-2">⭐ Meus Favoritos</h1>
          <p className="text-blue-100">Bem-vindo, {user.name}!</p>
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
            {favorites.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg mb-4">Você ainda não tem nenhum favorito</p>
                <Link
                  href="/dashboard"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Explorar Produtos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 mb-6">
                  Você tem {favorites.length} produto{favorites.length !== 1 ? 's' : ''} nos favoritos
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((product) => {
                    const lowestPrice = getLowestPrice(product.prices);
                    return (
                      <div key={product.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-gray-800 flex-1">
                            {product.name}
                          </h3>
                          <button
                            onClick={() => removeFavorite(product.id)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        {lowestPrice ? (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-gray-500 text-sm">Melhor preço</p>
                            <p className="text-2xl font-bold text-green-600 mb-2">
                              R$ {lowestPrice.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                              em {lowestPrice.store.name}
                            </p>
                            {product.prices.length > 1 && (
                              <p className="text-xs text-blue-600 mb-4">
                                Disponível em {product.prices.length} lojas
                              </p>
                            )}
                            <Link
                              href="/dashboard"
                              className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Ver Comparação
                            </Link>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm mt-4">Preço indisponível</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
