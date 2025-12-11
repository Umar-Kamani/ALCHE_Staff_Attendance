import { useState } from 'react';
import { User, Employee, AttendanceRecord, ParkingConfig } from '../App';
import { LogOut, UserPlus, Download, Calendar, Filter, Building2, BarChart3 } from 'lucide-react';
import { EmployeeManagement } from './EmployeeManagement';
import { AttendanceReports } from './AttendanceReports';
import { HRAnalytics } from './HRAnalytics';
import logo from 'figma:asset/8cb4e74c943326f982bc5bf90d14623946c7755b.png';

interface HRDashboardProps {
  user: User;
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  parkingConfig: ParkingConfig;
  onLogout: () => void;
  onAddEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onDeleteAttendance: (id: string) => void;
}

export function HRDashboard({
  user,
  employees,
  attendanceRecords,
  parkingConfig,
  onLogout,
  onAddEmployee,
  onDeleteEmployee,
  onUpdateEmployee,
  onUpdateAttendance,
  onDeleteAttendance,
}: HRDashboardProps) {
  const [activeTab, setActiveTab] = useState<'employees' | 'reports' | 'analytics'>('employees');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const exportToCSV = (startDate?: string, endDate?: string) => {
    let recordsToExport = attendanceRecords;

    // Filter by date range if provided
    if (startDate && endDate) {
      recordsToExport = attendanceRecords.filter(record => {
        return record.date >= startDate && record.date <= endDate;
      });
    }

    // Create CSV content
    const headers = ['Name', 'Date', 'Time In', 'Time Out', 'Plate Number', 'Type'];
    const rows = recordsToExport.map(record => [
      record.employeeName,
      record.date,
      record.timeIn,
      record.timeOut || '-',
      record.plateNumber || '-',
      record.isGuest ? 'Guest' : 'Staff',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filename = startDate && endDate 
      ? `attendance_report_${startDate}_to_${endDate}.csv`
      : `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportModal(false);
  };

  const handleExport = () => {
    if (exportStartDate && exportEndDate) {
      if (exportStartDate > exportEndDate) {
        alert('Start date must be before end date');
        return;
      }
      exportToCSV(exportStartDate, exportEndDate);
    } else {
      alert('Please select both start and end dates');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(r => r.date === today);
  const activeStaff = todayRecords.filter(r => r.timeOut === null && !r.isGuest);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-3">
            {/* Mobile: Logo and buttons on first row */}
            <div className="flex sm:hidden items-center justify-between">
              <img src={logo} alt="VUCUE" className="h-10" />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#BF2C34] text-white rounded-lg hover:bg-[#8f2127] transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Mobile: Title and welcome on second row */}
            <div className="sm:hidden">
              <h1 className="text-gray-900 text-center text-[24px] font-bold">HR Dashboard</h1>
              <p className="text-gray-600 text-center">Welcome, {user.username}</p>
            </div>

            {/* Desktop: Original layout */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="VUCUE" className="h-12" />
                <div>
                  <h1 className="text-gray-900">HR Dashboard</h1>
                  <p className="text-gray-600">Welcome, {user.username}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#BF2C34] text-white rounded-lg hover:bg-[#8f2127] transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-gray-900 mb-4">Export Attendance Report</h2>
            <p className="text-gray-600 mb-4">Select the date range for the export</p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="startDate" className="block text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleExport}
                  className="flex-1 bg-[#BF2C34] text-white py-2 rounded-lg hover:bg-[#8f2127] transition-colors"
                >
                  Export
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-1">
              <Building2 className="w-5 h-5 text-[#002E6D]" />
              <p className="text-gray-600">On Campus</p>
            </div>
            <p className="text-gray-900">{activeStaff.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 mb-1">Total Employees</p>
            <p className="text-gray-900">{employees.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 mb-1">Total Records</p>
            <p className="text-gray-900">{attendanceRecords.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 mb-1">Today's Attendance</p>
            <p className="text-gray-900">
              {
                attendanceRecords.filter(
                  r => r.date === new Date().toISOString().split('T')[0]
                ).length
              }
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 mb-1">Parking Utilization</p>
            <p className="text-gray-900">
              {parkingConfig.totalSpaces > 0
                ? ((parkingConfig.occupiedSpaces / parkingConfig.totalSpaces) * 100).toFixed(0)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('employees')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'employees'
                    ? 'border-[#002E6D] text-[#002E6D]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                Employee Management
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'reports'
                    ? 'border-[#002E6D] text-[#002E6D]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-5 h-5" />
                Attendance Reports
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-[#002E6D] text-[#002E6D]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                HR Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'employees' ? (
          <EmployeeManagement employees={employees} onAddEmployee={onAddEmployee} onDeleteEmployee={onDeleteEmployee} onUpdateEmployee={onUpdateEmployee} />
        ) : activeTab === 'reports' ? (
          <AttendanceReports
            attendanceRecords={attendanceRecords}
            employees={employees}
            onUpdateAttendance={onUpdateAttendance}
            onDeleteAttendance={onDeleteAttendance}
          />
        ) : (
          <HRAnalytics
            attendanceRecords={attendanceRecords}
            employees={employees}
          />
        )}
      </div>
    </div>
  );
}