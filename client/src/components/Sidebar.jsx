import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ChartBarIcon,
  EnvelopeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
    isActive
      ? 'bg-gray-800 text-blue-400 font-semibold'
      : 'text-gray-300 hover:bg-gray-800 hover:text-blue-300'
  }`;

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-60 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 md:opacity-0' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-gray-900 border-r border-gray-800 shadow-xl transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col text-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
            <span className="text-lg font-semibold text-white">Nexus-CRM</span>
            <button
              className="md:hidden p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              <li>
                <NavLink to="/dashboard" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                  <HomeIcon className="h-5 w-5" />
                  <span>Dashboard</span>
                </NavLink>
              </li>

              {user?.role === 'admin' && (
                <>
                  <li>
                    <NavLink to="/users" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                      <UsersIcon className="h-5 w-5" />
                      <span>User Management</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/orders" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                      <ChartBarIcon className="h-5 w-5" />
                      <span>Orders</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/campaigns/new" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                      <EnvelopeIcon className="h-5 w-5" />
                      <span>Create Campaign</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/campaigns/history" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                      <ChartBarIcon className="h-5 w-5" />
                      <span>Campaign History</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/reports" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                      <ChartBarIcon className="h-5 w-5" />
                      <span>Reports</span>
                    </NavLink>
                  </li>
                </>
              )}

              <li>
                <NavLink to="/profile" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                  <UserCircleIcon className="h-5 w-5" />
                  <span>My Profile</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/settings" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                  <Cog6ToothIcon className="h-5 w-5" />
                  <span>Settings</span>
                </NavLink>
              </li>

              {user?.role === 'admin' && (
                <li>
                  <NavLink to="/messages" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                    <EnvelopeIcon className="h-5 w-5" />
                    <span>Messages</span>
                  </NavLink>
                </li>
              )}
            </ul>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-800 text-sm text-gray-500 px-4">
              Version 1.0.0
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
