import { useState } from 'react';
import { User, Employee, AttendanceRecord, ParkingConfig } from '../App';
import { LogOut, Car, Users, ParkingSquare, UserPlus } from 'lucide-react';
import { AttendanceForm } from './AttendanceForm';
import { ParkingMonitor } from './ParkingMonitor';
import { TodayAttendanceList } from './TodayAttendanceList';
import logo from 'figma:asset/8cb4e74c943326f982bc5bf90d14623946c7755b.png';

interface SecurityGuardDashboardProps {
  user: User;
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  parkingConfig: ParkingConfig;
  onLogout: () => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onUpdateParkingConfig: (config: ParkingConfig) => void;
}

export function SecurityGuardDashboard({
  user,
  employees,
  attendanceRecords,
  parkingConfig,
  onLogout,
  onUpdateAttendance,
  onUpdateParkingConfig,
}: SecurityGuardDashboardProps) {
  const [activeTab, setActiveTab] = useState<'entry' | 'exit' | 'guest' | 'guestExit'>('entry');

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(r => r.date === today);
  const activeStaff = todayRecords.filter(r => r.timeOut === null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="VUCUE" className="h-12" />
              <div>
                <h1 className="text-gray-900">Security Guard Dashboard</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Present Today</p>
                <p className="text-gray-900">{activeStaff.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="bg-[#002E6D] p-3 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600">Vehicles Today</p>
                <p className="text-gray-900">
                  {todayRecords.filter(r => r.plateNumber).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="bg-[#BF2C34] p-3 rounded-lg">
                <ParkingSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600">Parking Available</p>
                <p className="text-gray-900">
                  {parkingConfig.totalSpaces - parkingConfig.occupiedSpaces} / {parkingConfig.totalSpaces}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('entry')}
                    className={`flex-1 px-6 py-4 border-b-2 transition-colors ${
                      activeTab === 'entry'
                        ? 'border-[#002E6D] text-[#002E6D]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mark Entry
                  </button>
                  <button
                    onClick={() => setActiveTab('exit')}
                    className={`flex-1 px-6 py-4 border-b-2 transition-colors ${
                      activeTab === 'exit'
                        ? 'border-[#002E6D] text-[#002E6D]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mark Exit
                  </button>
                  <button
                    onClick={() => setActiveTab('guest')}
                    className={`flex-1 px-6 py-4 border-b-2 transition-colors ${
                      activeTab === 'guest'
                        ? 'border-[#002E6D] text-[#002E6D]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Guest Entry
                  </button>
                  <button
                    onClick={() => setActiveTab('guestExit')}
                    className={`flex-1 px-6 py-4 border-b-2 transition-colors ${
                      activeTab === 'guestExit'
                        ? 'border-[#002E6D] text-[#002E6D]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Guest Exit
                  </button>
                </div>
              </div>

              <div className="p-6">
                <AttendanceForm
                  type={activeTab}
                  employees={employees}
                  attendanceRecords={attendanceRecords}
                  parkingConfig={parkingConfig}
                  onUpdateAttendance={onUpdateAttendance}
                  onUpdateParkingConfig={onUpdateParkingConfig}
                />
              </div>
            </div>

            {/* Today's Attendance */}
            <TodayAttendanceList records={todayRecords} />
          </div>

          {/* Right Column - Parking Monitor */}
          <div className="lg:col-span-1">
            <ParkingMonitor
              parkingConfig={parkingConfig}
              onUpdateParkingConfig={onUpdateParkingConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
}