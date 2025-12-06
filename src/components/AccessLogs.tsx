import { AccessLog } from '../App';
import { Activity, LogIn, LogOut } from 'lucide-react';

interface AccessLogsProps {
  accessLogs: AccessLog[];
}

export function AccessLogs({ accessLogs }: AccessLogsProps) {
  const sortedLogs = [...accessLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const recentLogs = sortedLogs.slice(0, 50);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-6 h-6 text-[#002E6D]" />
          <h2 className="text-gray-900">User Access Logs</h2>
          <span className="ml-auto text-gray-600">
            Showing {recentLogs.length} recent activities
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Timestamp</th>
                <th className="px-6 py-3 text-left text-gray-700">Username</th>
                <th className="px-6 py-3 text-left text-gray-700">Action</th>
                <th className="px-6 py-3 text-left text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No access logs available
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => {
                  const date = new Date(log.timestamp);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">
                        {date.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{log.username}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {log.action === 'login' ? (
                            <>
                              <LogIn className="w-4 h-4 text-green-600" />
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                Login
                              </span>
                            </>
                          ) : (
                            <>
                              <LogOut className="w-4 h-4 text-gray-600" />
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                Logout
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {date.toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
