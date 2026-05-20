'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
      fetchNotifications(token);
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

  const fetchNotifications = async (token: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      setError('Erro ao carregar notificações');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erro ao marcar como lido');
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erro ao marcar todos como lidos');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error('Erro ao deletar notificação');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PRICE_DROP':
        return '📉';
      case 'PRICE_ALERT':
        return '🚨';
      case 'NEW_PRODUCT':
        return '✨';
      case 'FLASH_SALE':
        return '⚡';
      default:
        return '📢';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Você precisa fazer login para ver as notificações</p>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">🔔 Notificações</h1>
              <p className="text-blue-100">
                Bem-vindo, {user.name}! {unreadCount > 0 && `(${unreadCount} não lida)`}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
              >
                Marcar todos como lido
              </button>
            )}
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
          <div className="max-w-2xl mx-auto space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">Nenhuma notificação por enquanto</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                    notification.isRead
                      ? 'border-gray-300 opacity-75'
                      : 'border-blue-600 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {getTypeIcon(notification.type)}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {notification.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Marcar
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
