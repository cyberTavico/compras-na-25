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

interface PriceAlert {
  id: string;
  product: Product;
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
}

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ productId: '', targetPrice: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchAlerts(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAlerts = async (token: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/price-alerts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlerts(response.data);
    } catch (err) {
      setError('Erro ao carregar alertas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (alertId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/price-alerts/${alertId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('Erro ao deletar alerta');
    }
  };

  const getLowestPrice = (prices: any[]) => {
    if (!prices.length) return null;
    return prices.reduce((lowest, current) =>
      current.price < lowest.price ? current : lowest
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 shadow-lg">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">🚨 Alertas de Preço</h1>
              <p className="text-blue-100">Receba notificações quando os preços caírem</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-600 rounded font-semibold transition-colors"
            >
              + Novo Alerta
            </button>
          </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List of Alerts */}
            <div className="lg:col-span-2">
              {alerts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-500 text-lg mb-4">Nenhum alerta criado ainda</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Criar Primeiro Alerta
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => {
                    const lowestPrice = getLowestPrice(alert.product.prices);
                    const isAlertTriggered =
                      lowestPrice && lowestPrice.price <= alert.targetPrice;

                    return (
                      <div
                        key={alert.id}
                        className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                          isAlertTriggered ? 'border-green-600' : 'border-blue-600'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {alert.product.name}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Meta de Preço</p>
                                <p className="text-xl font-bold text-blue-600">
                                  R$ {alert.targetPrice.toFixed(2)}
                                </p>
                              </div>
                              {lowestPrice && (
                                <div>
                                  <p className="text-sm text-gray-500">Menor Preço Atual</p>
                                  <p
                                    className={`text-xl font-bold ${
                                      isAlertTriggered
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                                  >
                                    R$ {lowestPrice.price.toFixed(2)}
                                  </p>
                                </div>
                              )}
                            </div>
                            {lowestPrice && (
                              <p className="text-sm text-gray-500 mt-2">
                                Melhor oferta em {lowestPrice.store.name}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  💡 Como Funciona
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Defina um preço alvo para o produto</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Receba notificações quando o preço cair</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Veja a melhor oferta em tempo real</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Gerencie múltiplos alertas simultaneamente</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
