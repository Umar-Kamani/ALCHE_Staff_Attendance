import { useState } from 'react';
import { User, Employee, AttendanceRecord, ParkingConfig, AccessLog, UserLog, APP_VERSION } from '../App';
import { LogOut, Shield, Users, Key, UserPlus, Trash2, Calendar, Activity, FileText } from 'lucide-react';
import { AccessLogs } from './AccessLogs';
import { UserLogs } from './UserLogs';
import logo from 'figma:asset/8cb4e74c943326f982bc5bf90d14623946c7755b.png';

interface SuperAdminDashboardProps {
  user: User;
  users: User[];
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  parkingConfig: ParkingConfig;
  accessLogs: AccessLog[];
  userLogs: UserLog[];
  onLogout: () => void;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export function SuperAdminDashboard({
  user,
  users,
  employees,
  attendanceRecords,
  parkingConfig,
  accessLogs,
  userLogs,
  onLogout,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'userLogs'>('users');
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  
  // Create user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'security' | 'hr' | 'dean'>('security');
  
  // Reset password form
  const [resetPassword, setResetPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if username already exists
    if (users.some(u => u.username === newUsername)) {
      alert('Username already exists');
      return;
    }

    const newUser: User = {
      id: `${newRole}-${Date.now()}`,
      username: newUsername.trim(),
      password: newPassword,
      role: newRole,
    };

    onAddUser(newUser);
    setNewUsername('');
    setNewPassword('');
    setNewRole('security');
    setShowCreateUserForm(false);
    alert('User created successfully');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (resetPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (resetPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (selectedUserForReset) {
      const updatedUser = {
        ...selectedUserForReset,
        password: resetPassword,
      };
      onUpdateUser(updatedUser);
      setShowResetPasswordModal(false);
      setSelectedUserForReset(null);
      setResetPassword('');
      setConfirmPassword('');
      alert('Password reset successfully');
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (userId === user.id) {
      alert('Cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user: ${username}?`)) {
      onDeleteUser(userId);
    }
  };

  const openResetPasswordModal = (userToReset: User) => {
    setSelectedUserForReset(userToReset);
    setResetPassword('');
    setConfirmPassword('');
    setShowResetPasswordModal(true);
  };

  const securityUsers = users.filter(u => u.role === 'security');
  const hrUsers = users.filter(u => u.role === 'hr');
  const superAdmins = users.filter(u => u.role === 'superadmin');
  const deanUsers = users.filter(u => u.role === 'dean');

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter(r => r.date === today);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#002E6D] to-[#001d45] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={logo} alt="VUCUE" className="h-10 sm:h-12" />
              <div>
                <h1 className="text-white">Super Admin Dashboard</h1>
                <p className="text-blue-100">Welcome, {user.username}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-[rgb(255,255,255)] bg-opacity-20 px-4 py-2 rounded-lg">
                <span className="text-[rgb(0,0,0)] flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span className="hidden sm:inline text-[rgb(0,0,0)]">Super Administrator</span>
                  <span className="sm:hidden">Admin</span>
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-10 text-[rgb(0,0,0)] hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-[rgb(0,0,0)]">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Users</p>
                <p className="text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600">Security Guards</p>
                <p className="text-gray-900">{securityUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">HR Users</p>
                <p className="text-gray-900">{hrUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600">Today's Attendance</p>
                <p className="text-gray-900">{todayAttendance.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg hover:bg-[#001d45] transition-colors shadow-sm ${
                activeTab === 'users' ? 'bg-[#002E6D] text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Users className="w-5 h-5" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg hover:bg-[#001d45] transition-colors shadow-sm ${
                activeTab === 'logs' ? 'bg-[#002E6D] text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Activity className="w-5 h-5" />
              Access Logs
            </button>
            <button
              onClick={() => setActiveTab('userLogs')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg hover:bg-[#001d45] transition-colors shadow-sm ${
                activeTab === 'userLogs' ? 'bg-[#002E6D] text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              User Logs
            </button>
          </div>
        </div>

        {/* User Management */}
        {activeTab === 'users' && (
          <>
            {/* Create User Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowCreateUserForm(!showCreateUserForm)}
                className="flex items-center gap-2 px-6 py-3 bg-[#002E6D] text-white rounded-lg hover:bg-[#001d45] transition-colors shadow-sm"
              >
                <UserPlus className="w-5 h-5" />
                Create New User
              </button>
            </div>

            {/* Create User Form */}
            {showCreateUserForm && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-gray-900 mb-4">Create New User</h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="newUsername" className="block text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        id="newUsername"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                        placeholder="Enter username"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                        placeholder="Enter password"
                        minLength={6}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="newRole" className="block text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        id="newRole"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as 'security' | 'hr' | 'dean')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                      >
                        <option value="security">Security Guard</option>
                        <option value="hr">HR</option>
                        <option value="dean">Dean</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-[#002E6D] text-white py-2 rounded-lg hover:bg-[#001d45] transition-colors"
                    >
                      Create User
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateUserForm(false);
                        setNewUsername('');
                        setNewPassword('');
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* User Management Tables */}
            <div className="space-y-6">
              {/* Super Admins */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#002E6D] bg-opacity-5 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-[rgb(255,255,255)] flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#002E6D]" />
                    Super Administrators
                  </h2>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700">Username</th>
                      <th className="px-6 py-3 text-left text-gray-700">Role</th>
                      <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {superAdmins.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">{u.username}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-[#002E6D] text-white rounded-full">
                            Super Admin
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openResetPasswordModal(u)}
                            className="flex items-center gap-1 text-[#002E6D] hover:text-[#001d45]"
                          >
                            <Key className="w-4 h-4" />
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Security Guards */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#002E6D] bg-opacity-5 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-[rgb(255,255,255)] flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#002E6D]" />
                    Security Guards
                  </h2>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700">Username</th>
                      <th className="px-6 py-3 text-left text-gray-700">Role</th>
                      <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {securityUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No security users
                        </td>
                      </tr>
                    ) : (
                      securityUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-900">{u.username}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                              Security
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => openResetPasswordModal(u)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <Key className="w-4 h-4" />
                                Reset Password
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id!, u.username)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* HR Users */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#BF2C34] bg-opacity-5 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-[rgb(255,255,255)] flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#BF2C34]" />
                    HR Users
                  </h2>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700">Username</th>
                      <th className="px-6 py-3 text-left text-gray-700">Role</th>
                      <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {hrUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No HR users
                        </td>
                      </tr>
                    ) : (
                      hrUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-900">{u.username}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-[#BF2C34] text-white rounded-full">
                              HR
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => openResetPasswordModal(u)}
                                className="flex items-center gap-1 text-[#002E6D] hover:text-[#001d45]"
                              >
                                <Key className="w-4 h-4" />
                                Reset Password
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id!, u.username)}
                                className="flex items-center gap-1 text-[#BF2C34] hover:text-[#8f2127]"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dean Users */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#FFA500] bg-opacity-5 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-[rgb(255,255,255)] flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#FFA500]" />
                    Dean Users
                  </h2>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700">Username</th>
                      <th className="px-6 py-3 text-left text-gray-700">Role</th>
                      <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {deanUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No Dean users
                        </td>
                      </tr>
                    ) : (
                      deanUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-900">{u.username}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-[#FFA500] text-white rounded-full">
                              Dean
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => openResetPasswordModal(u)}
                                className="flex items-center gap-1 text-[#002E6D] hover:text-[#001d45]"
                              >
                                <Key className="w-4 h-4" />
                                Reset Password
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id!, u.username)}
                                className="flex items-center gap-1 text-[#FFA500] hover:text-[#FF8C00]"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Access Logs */}
        {activeTab === 'logs' && (
          <AccessLogs accessLogs={accessLogs} />
        )}

        {/* User Logs */}
        {activeTab === 'userLogs' && (
          <UserLogs userLogs={userLogs} />
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500">
          <p>Made by ALCHE Tech Team</p>
          <p>Collaborators: Joel Salomon, Umar Kamani</p>
          <p className="mt-2">Version {APP_VERSION}</p>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUserForReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-gray-900 mb-4">Reset Password</h2>
            <p className="text-gray-600 mb-4">
              Reset password for: <strong>{selectedUserForReset.username}</strong>
            </p>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="resetPassword" className="block text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="resetPassword"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                  placeholder="Enter new password"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                  placeholder="Confirm new password"
                  minLength={6}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#002E6D] text-white py-2 rounded-lg hover:bg-[#001d45] transition-colors"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setSelectedUserForReset(null);
                    setResetPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}