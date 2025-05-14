import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import axios from 'axios';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'admin') {
          const res = await axios.get('/api/customers');
          const users = res.data;

          setStats({
            totalUsers: users.length,
            activeUsers: users.filter((u) => u.status === 'active').length,
            admins: users.filter((u) => u.role === 'admin').length,
          });
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="pt-16 pb-6 text-gray-800 dark:text-gray-100">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card title="Welcome">
          <p>Hello, <span className="font-medium">{user?.name}</span>!</p>
          <p className="mt-2">
            You are logged in as: <span className="font-medium capitalize">{user?.role}</span>
          </p>
        </Card>

        {user?.role === 'admin' && (
          <>
            <Card title="User Stats">
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
            </Card>

            <Card title="Quick Links">
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
            </Card>
          </>
        )}
      </div>

      <Card title="System Info">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Last Login:</span>
            <span>{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>User Status:</span>
            <span className="capitalize">{user?.status || 'unknown'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;
