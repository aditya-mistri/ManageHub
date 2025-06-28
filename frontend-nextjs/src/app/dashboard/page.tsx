'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/Layout/Layout';
import apiClient from '@/lib/api';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  admins: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'admin') {
          const users = await apiClient.getCustomers();
          setStats({
            totalUsers: users.length,
            activeUsers: users.filter((u: any) => u.status === 'active').length,
            admins: users.filter((u: any) => u.role === 'admin').length,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <Layout>
      <div className="pt-16 pb-6 text-gray-800 dark:text-gray-100">
        <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Welcome
            </h3>
            <p>Hello, <span className="font-medium">{user?.name}</span>!</p>
            <p className="mt-2">
              You are logged in as: <span className="font-medium capitalize">{user?.role}</span>
            </p>
          </div>

          {user?.role === 'admin' && (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  User Stats
                </h3>
                {loading ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading stats...</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Users:</span>
                      <span className="font-semibold">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Users:</span>
                      <span className="font-semibold">{stats.activeUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Admins:</span>
                      <span className="font-semibold">{stats.admins}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/users" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      Manage Users
                    </a>
                  </li>
                  <li>
                    <a href="/settings" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      System Settings
                    </a>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            System Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Last Login:</span>
              <span>{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>User Status:</span>
              <span className="capitalize">Active</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}