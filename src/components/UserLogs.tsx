import { useState } from 'react';
import { UserLog } from '../App';
import { FileText, Filter, Search } from 'lucide-react';

interface UserLogsProps {
  userLogs: UserLog[];
}

export function UserLogs({ userLogs }: UserLogsProps) {
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredLogs = userLogs.filter((log) => {
    const matchesUser =
      !filterUser ||
      log.username.toLowerCase().includes(filterUser.toLowerCase());
    const matchesAction =
      !filterAction ||
      log.action.toLowerCase().includes(filterAction.toLowerCase());
    const matchesDate =
      !filterDate ||
      new Date(log.timestamp).toISOString().split('T')[0] === filterDate;
    return matchesUser && matchesAction && matchesDate;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Get unique actions for filter dropdown
  const uniqueActions = Array.from(new Set(userLogs.map(log => log.action))).sort();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-[#002E6D] text-white';
      case 'hr':
        return 'bg-[#BF2C34] text-white';
      case 'security':
        return 'bg-blue-100 text-blue-700';
      case 'dean':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'hr':
        return 'HR';
      case 'security':
        return 'Security';
      case 'dean':
        return 'Dean';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#002E6D]" />
          <h3 className="text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="filterUser" className="block text-gray-700 mb-2">
              Filter by User
            </label>
            <input
              type="text"
              id="filterUser"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
              placeholder="Search by username..."
            />
          </div>

          <div>
            <label htmlFor="filterAction" className="block text-gray-700 mb-2">
              Filter by Action
            </label>
            <select
              id="filterAction"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
            >
              <option value="">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filterDate" className="block text-gray-700 mb-2">
              Filter by Date
            </label>
            <input
              type="date"
              id="filterDate"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
            />
          </div>
        </div>

        {(filterUser || filterAction || filterDate) && (
          <button
            onClick={() => {
              setFilterUser('');
              setFilterAction('');
              setFilterDate('');
            }}
            className="mt-4 text-[#002E6D] hover:text-[#001d45]"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#002E6D]" />
            <h2 className="text-gray-900">User Activity Logs</h2>
            <span className="ml-auto text-gray-600">
              Showing {sortedLogs.length} logs
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Timestamp</th>
                <th className="px-6 py-3 text-left text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-gray-700">Action</th>
                <th className="px-6 py-3 text-left text-gray-700">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                sortedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{log.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(log.role)}`}>
                        {formatRole(log.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
