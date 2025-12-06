import { useState } from 'react';
import { User, APP_VERSION } from '../App';
import { ShieldCheck, LogIn } from 'lucide-react';
import logo from 'figma:asset/8cb4e74c943326f982bc5bf90d14623946c7755b.png';

interface LoginPageProps {
  onLogin: (user: User) => void;
  users: User[];
}

export function LoginPage({ onLogin, users }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      onLogin({ username: user.username, role: user.role, id: user.id });
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="VUCUE African Leadership College" className="h-20 mb-4" />
          <p className="text-center text-gray-600">Attendance & Vehicle Tracking System</p>
          <p className="text-center text-gray-400 mt-1">v{APP_VERSION}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#002E6D] text-white py-3 rounded-lg hover:bg-[#001d45] transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Login
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">Demo Credentials:</p>
          <div className="space-y-1">
            <p className="text-gray-700">Super Admin: admin / admin123</p>
            <p className="text-gray-700">Security: security / security123</p>
            <p className="text-gray-700">HR: hr / hr123</p>
            <p className="text-gray-700">Dean: dean / dean123</p>
          </div>
        </div>

        {/* Credits */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600">Made by ALCHE Tech Team</p>
          <p className="text-gray-500">Collaborators: Joel Salomon, Umar Kamani</p>
        </div>
      </div>
    </div>
  );
}