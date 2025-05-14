import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { User, Mail, Shield, Calendar, LogIn } from 'lucide-react';

function Profile() {
  const { user } = useAuth();

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  return (
    <div className="pt-16 pb-8 px-4 md:px-8 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar and Role */}
        <Card>
          <div className="flex flex-col items-center text-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-32 w-32 rounded-full mb-4 border-4 border-gray-700"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-gray-700 flex items-center justify-center text-3xl text-gray-400 mb-4">
                {user?.name?.charAt(0)}
              </div>
            )}
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className="mt-3 px-3 py-1 rounded-full text-xs font-medium bg-indigo-600 bg-opacity-20 text-indigo-300 capitalize">
              {user?.role}
            </span>
          </div>
        </Card>

        {/* Account Info */}
        <div className="md:col-span-2">
          <Card title="Account Information">
            <div className="space-y-4">
              <InfoRow icon={<User size={16} />} label="Full Name" value={user?.name} />
              <InfoRow icon={<Mail size={16} />} label="Email" value={user?.email} />
              <InfoRow icon={<Shield size={16} />} label="Role" value={user?.role} capitalize />
              <InfoRow label="Status" value={user?.status} capitalize />
              <InfoRow icon={<Calendar size={16} />} label="Account Created" value={formatDate(user?.createdAt)} />
              <InfoRow icon={<LogIn size={16} />} label="Last Login" value={formatDate(user?.lastLogin)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ label, value, icon, capitalize }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-400 flex items-center gap-1">
      {icon && <span>{icon}</span>}
      {label}
    </h3>
    <p className={`mt-1 text-sm ${capitalize ? 'capitalize' : ''}`}>{value || '—'}</p>
  </div>
);

export default Profile;
