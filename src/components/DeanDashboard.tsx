import { useState } from 'react';
import { User, Employee, AttendanceRecord, ParkingConfig } from '../App';
import { LogOut, Calendar, TrendingUp, Users, Car, Clock, BarChart3 } from 'lucide-react';
import { AttendanceReports } from './AttendanceReports';
import logo from 'figma:asset/8cb4e74c943326f982bc5bf90d14623946c7755b.png';

interface DeanDashboardProps {
  user: User;
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  parkingConfig: ParkingConfig;
  onLogout: () => void;
}

export function DeanDashboard({
  user,
  employees,
  attendanceRecords,
  parkingConfig,
  onLogout,
}: DeanDashboardProps) {
  const [activeTab, setActiveTab] = useState<'live' | 'historical'>('live');

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(r => r.date === today);
  const activeStaff = todayRecords.filter(r => r.timeOut === null && !r.isGuest);
  const activeGuests = todayRecords.filter(r => r.timeOut === null && r.isGuest);
  const completedToday = todayRecords.filter(r => r.timeOut !== null);

  // Calculate weekly statistics
  const getWeekStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    const weekRecords = attendanceRecords.filter(r => r.date >= weekAgoStr && r.date <= today);
    const uniqueDays = [...new Set(weekRecords.map(r => r.date))];
    
    return {
      totalAttendance: weekRecords.length,
      avgPerDay: uniqueDays.length > 0 ? (weekRecords.length / uniqueDays.length).toFixed(1) : '0',
      uniqueEmployees: new Set(weekRecords.filter(r => !r.isGuest).map(r => r.employeeId)).size,
      totalGuests: weekRecords.filter(r => r.isGuest).length,
    };
  };

  const weekStats = getWeekStats();

  // Calculate monthly statistics
  const getMonthStats = () => {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAgoStr = monthAgo.toISOString().split('T')[0];
    
    const monthRecords = attendanceRecords.filter(r => r.date >= monthAgoStr && r.date <= today);
    const uniqueDays = [...new Set(monthRecords.map(r => r.date))];
    
    return {
      totalAttendance: monthRecords.length,
      avgPerDay: uniqueDays.length > 0 ? (monthRecords.length / uniqueDays.length).toFixed(1) : '0',
      peakDay: getPeakDay(monthRecords),
    };
  };

  const getPeakDay = (records: AttendanceRecord[]) => {
    const dayCounts: { [key: string]: number } = {};
    records.forEach(r => {
      dayCounts[r.date] = (dayCounts[r.date] || 0) + 1;
    });
    
    let maxDate = '';
    let maxCount = 0;
    Object.entries(dayCounts).forEach(([date, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxDate = date;
      }
    });
    
    return { date: maxDate, count: maxCount };
  };

  const monthStats = getMonthStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="VUCUE" className="h-10" />
              <div>
                <h1 className="text-[#002E6D]">Dean Analytics Dashboard</h1>
                <p className="text-gray-600">Welcome, {user.username}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('live')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'live'
                  ? 'border-[#002E6D] text-[#002E6D]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Live Analytics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('historical')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'historical'
                  ? 'border-[#002E6D] text-[#002E6D]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Historical Reports
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'live' ? (
          <div className="space-y-6">
            {/* Live Statistics Cards */}
            <div>
              <h2 className="text-gray-900 mb-4">Today's Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Active Staff */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Staff on Campus</span>
                    <Users className="w-5 h-5 text-[#002E6D]" />
                  </div>
                  <div className="text-[#002E6D]">{activeStaff.length}</div>
                  <p className="text-gray-500 mt-1">Currently present</p>
                </div>

                {/* Active Guests */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Active Guests</span>
                    <Users className="w-5 h-5 text-[#BF2C34]" />
                  </div>
                  <div className="text-[#BF2C34]">{activeGuests.length}</div>
                  <p className="text-gray-500 mt-1">Currently on campus</p>
                </div>

                {/* Parking Occupancy */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Parking Occupancy</span>
                    <Car className="w-5 h-5 text-[#002E6D]" />
                  </div>
                  <div className="text-[#002E6D]">
                    {parkingConfig.occupiedSpaces}/{parkingConfig.totalSpaces}
                  </div>
                  <p className="text-gray-500 mt-1">
                    {((parkingConfig.occupiedSpaces / parkingConfig.totalSpaces) * 100).toFixed(0)}% occupied
                  </p>
                </div>

                {/* Completed Today */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Completed Attendance</span>
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-green-600">{completedToday.length}</div>
                  <p className="text-gray-500 mt-1">Check-in & check-out done</p>
                </div>
              </div>
            </div>

            {/* Weekly Summary */}
            <div>
              <h2 className="text-gray-900 mb-4">Last 7 Days Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-gray-600 mb-2">Total Attendance</div>
                  <div className="text-[#002E6D]">{weekStats.totalAttendance}</div>
                  <p className="text-gray-500 mt-1">Records in last 7 days</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-gray-600 mb-2">Average Per Day</div>
                  <div className="text-[#002E6D]">{weekStats.avgPerDay}</div>
                  <p className="text-gray-500 mt-1">Attendance records/day</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-gray-600 mb-2">Unique Employees</div>
                  <div className="text-[#002E6D]">{weekStats.uniqueEmployees}</div>
                  <p className="text-gray-500 mt-1">Different staff members</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-gray-600 mb-2">Total Guests</div>
                  <div className="text-[#BF2C34]">{weekStats.totalGuests}</div>
                  <p className="text-gray-500 mt-1">Visitors in 7 days</p>
                </div>
              </div>
            </div>

            {/* Monthly Summary */}
            <div>
              <h2 className="text-gray-900 mb-4">Last 30 Days Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-gray-600 mb-2">Total Attendance</div>
                  <div className="text-[#002E6D]">{monthStats.totalAttendance}</div>
                  <p className="text-gray-500 mt-1">Records in last 30 days</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-gray-600 mb-2">Daily Average</div>
                  <div className="text-[#002E6D]">{monthStats.avgPerDay}</div>
                  <p className="text-gray-500 mt-1">Attendance records/day</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-gray-600 mb-2">Peak Day</div>
                  <div className="text-[#002E6D]">{monthStats.peakDay.count}</div>
                  <p className="text-gray-500 mt-1">
                    {monthStats.peakDay.date ? new Date(monthStats.peakDay.date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Staff List */}
            <div>
              <h2 className="text-gray-900 mb-4">Currently on Campus</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-500">Employee</th>
                        <th className="px-6 py-3 text-left text-gray-500">Time In</th>
                        <th className="px-6 py-3 text-left text-gray-500">Plate Number</th>
                        <th className="px-6 py-3 text-left text-gray-500">Type</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {todayRecords
                        .filter(r => r.timeOut === null)
                        .map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-900">{record.employeeName}</td>
                            <td className="px-6 py-4 text-gray-600">{record.timeIn}</td>
                            <td className="px-6 py-4 text-gray-600">
                              {record.plateNumber || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-white ${
                                  record.isGuest ? 'bg-[#BF2C34]' : 'bg-[#002E6D]'
                                }`}
                              >
                                {record.isGuest ? 'Guest' : 'Staff'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      {todayRecords.filter(r => r.timeOut === null).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            No one currently on campus
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <AttendanceReports
              attendanceRecords={attendanceRecords}
              employees={employees}
            />
          </div>
        )}
      </main>
    </div>
  );
}
