'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ChartBarIcon,
  EnvelopeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { NavItem } from '@/types';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'User Management', href: '/users', icon: UsersIcon, adminOnly: true },
  { name: 'Orders', href: '/orders', icon: ChartBarIcon, adminOnly: true },
  { name: 'Create Campaign', href: '/campaigns/new', icon: EnvelopeIcon, adminOnly: true },
  { name: 'Campaign History', href: '/campaigns/history', icon: ChartBarIcon, adminOnly: true },
  { name: 'My Profile', href: '/profile', icon: UserCircleIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

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
            <span className="text-lg font-semibold text-white">CRM Pro</span>
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
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={classNames(
                        isActive
                          ? 'bg-gray-800 text-blue-400 font-semibold'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-blue-300',
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
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