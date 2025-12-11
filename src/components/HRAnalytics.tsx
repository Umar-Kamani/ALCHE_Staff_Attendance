import { Employee, AttendanceRecord } from '../App';
import { TrendingUp, Users, Calendar, BarChart3, Download } from 'lucide-react';

interface HRAnalyticsProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
}

export function HRAnalytics({ employees, attendanceRecords }: HRAnalyticsProps) {
  // Get current date
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Calculate start of current week (Monday)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(today);
  startOfWeek.setHours(0, 0, 0, 0);

  // Calculate start of current month
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  
  // Filter staff-only records (exclude guests)
  const staffRecords = attendanceRecords.filter(r => !r.isGuest);

  // Calculate weekly analytics (at least 4 days per week)
  const calculateWeeklyAnalytics = () => {
    const weekRecords = staffRecords.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= startOfWeek && recordDate <= today;
    });

    // Group by employee and count unique days
    const employeeDays: { [key: string]: Set<string> } = {};
    weekRecords.forEach(record => {
      if (!employeeDays[record.employeeId]) {
        employeeDays[record.employeeId] = new Set();
      }
      employeeDays[record.employeeId].add(record.date);
    });

    // Count employees with at least 4 days
    const employeesWithMin4Days = Object.values(employeeDays).filter(
      days => days.size >= 4
    ).length;

    const totalEmployees = employees.length;
    const percentage = totalEmployees > 0 
      ? ((employeesWithMin4Days / totalEmployees) * 100).toFixed(1)
      : '0.0';

    return {
      count: employeesWithMin4Days,
      total: totalEmployees,
      percentage,
    };
  };

  // Calculate monthly analytics (at least 16 days per month)
  const calculateMonthlyAnalytics = () => {
    const monthRecords = staffRecords.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= startOfMonth && recordDate <= today;
    });

    // Group by employee and count unique days
    const employeeDays: { [key: string]: Set<string> } = {};
    monthRecords.forEach(record => {
      if (!employeeDays[record.employeeId]) {
        employeeDays[record.employeeId] = new Set();
      }
      employeeDays[record.employeeId].add(record.date);
    });

    // Count employees with at least 16 days
    const employeesWithMin16Days = Object.values(employeeDays).filter(
      days => days.size >= 16
    ).length;

    const totalEmployees = employees.length;
    const percentage = totalEmployees > 0 
      ? ((employeesWithMin16Days / totalEmployees) * 100).toFixed(1)
      : '0.0';

    return {
      count: employeesWithMin16Days,
      total: totalEmployees,
      percentage,
      employeeDays,
    };
  };

  // Calculate average presence on campus (monthly basis)
  const calculateAveragePresence = () => {
    const monthRecords = staffRecords.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= startOfMonth && recordDate <= today;
    });

    // Count unique days in the month that have records
    const uniqueDates = new Set(monthRecords.map(r => r.date));
    const daysWithData = uniqueDates.size;

    if (daysWithData === 0) {
      return {
        avgPresence: 0,
        totalRecords: 0,
        daysWithData: 0,
      };
    }

    // Calculate average number of staff per day
    const dailyCounts: { [key: string]: Set<string> } = {};
    monthRecords.forEach(record => {
      if (!dailyCounts[record.date]) {
        dailyCounts[record.date] = new Set();
      }
      dailyCounts[record.date].add(record.employeeId);
    });

    const totalStaffAcrossDays = Object.values(dailyCounts).reduce(
      (sum, employeeSet) => sum + employeeSet.size,
      0
    );

    const avgPresence = (totalStaffAcrossDays / daysWithData).toFixed(1);

    return {
      avgPresence,
      totalRecords: monthRecords.length,
      daysWithData,
    };
  };

  // Get detailed breakdown for employees (for monthly presence)
  const getEmployeeBreakdown = () => {
    const monthRecords = staffRecords.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= startOfMonth && recordDate <= today;
    });

    const employeeDays: { [key: string]: { name: string; days: Set<string> } } = {};
    
    monthRecords.forEach(record => {
      if (!employeeDays[record.employeeId]) {
        employeeDays[record.employeeId] = {
          name: record.employeeName,
          days: new Set(),
        };
      }
      employeeDays[record.employeeId].days.add(record.date);
    });

    // Convert to array and sort by number of days (descending)
    const breakdown = Object.entries(employeeDays)
      .map(([_, data]) => ({
        name: data.name,
        daysPresent: data.days.size,
      }))
      .sort((a, b) => b.daysPresent - a.daysPresent);

    return breakdown;
  };

  const weeklyStats = calculateWeeklyAnalytics();
  const monthlyStats = calculateMonthlyAnalytics();
  const avgPresence = calculateAveragePresence();
  const employeeBreakdown = getEmployeeBreakdown();

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  // Export analytics to CSV
  const exportAnalyticsToCSV = () => {
    const csvLines: string[] = [];
    
    // Title
    csvLines.push(`"HR Analytics Report - ${monthName} ${currentYear}"`);
    csvLines.push(`"Generated on: ${new Date().toLocaleString()}"`);
    csvLines.push('');
    
    // Summary Statistics
    csvLines.push('"SUMMARY STATISTICS"');
    csvLines.push('');
    
    csvLines.push('"Weekly Attendance (≥ 4 days/week)"');
    csvLines.push(`"Staff Count","${weeklyStats.count}"`);
    csvLines.push(`"Total Staff","${weeklyStats.total}"`);
    csvLines.push(`"Percentage","${weeklyStats.percentage}%"`);
    csvLines.push('');
    
    csvLines.push(`"Monthly Attendance (≥ 16 days in ${monthName})"`);
    csvLines.push(`"Staff Count","${monthlyStats.count}"`);
    csvLines.push(`"Total Staff","${monthlyStats.total}"`);
    csvLines.push(`"Percentage","${monthlyStats.percentage}%"`);
    csvLines.push('');
    
    csvLines.push('"Average Daily Presence"');
    csvLines.push(`"Avg Staff/Day","${avgPresence.avgPresence}"`);
    csvLines.push(`"Days Tracked","${avgPresence.daysWithData}"`);
    csvLines.push(`"Total Attendance Records","${avgPresence.totalRecords}"`);
    csvLines.push('');
    
    // Monthly Summary
    csvLines.push('"MONTHLY SUMMARY"');
    csvLines.push(`"Total Staff","${employees.length}"`);
    csvLines.push(`"Staff with Records","${employeeBreakdown.length}"`);
    csvLines.push(`"Total Attendance","${avgPresence.totalRecords}"`);
    csvLines.push(`"Days Tracked","${avgPresence.daysWithData}"`);
    csvLines.push('');
    csvLines.push('');
    
    // Individual Employee Breakdown
    csvLines.push(`"INDIVIDUAL EMPLOYEE ATTENDANCE - ${monthName} ${currentYear}"`);
    csvLines.push('\"Rank\",\"Employee Name\",\"Days Present\",\"Status\"');
    
    if (employeeBreakdown.length > 0) {
      employeeBreakdown.forEach((emp, index) => {
        const status = emp.daysPresent >= 16 ? 'Excellent' :
                      emp.daysPresent >= 12 ? 'Good' :
                      emp.daysPresent >= 8 ? 'Fair' : 'Low';
        csvLines.push(`\"${index + 1}\",\"${emp.name}\",\"${emp.daysPresent}\",\"${status}\"`);
      });
    } else {
      csvLines.push(`\"No attendance records for ${monthName} ${currentYear}\"`);
    }
    
    csvLines.push('');
    csvLines.push('');
    
    // Employees with no attendance
    const employeesWithNoAttendance = employees.filter(
      emp => !employeeBreakdown.find(b => b.name === emp.name)
    );
    
    if (employeesWithNoAttendance.length > 0) {
      csvLines.push(`"STAFF WITH NO ATTENDANCE RECORDS - ${monthName}"`);
      csvLines.push('\"Employee Name\",\"Email\"');
      employeesWithNoAttendance.forEach(emp => {
        csvLines.push(`\"${emp.name}\",\"${emp.email || 'N/A'}\"`);
      });
    }
    
    // Create and download CSV
    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hr_analytics_${monthName}_${currentYear}_${today.toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-gray-900 mb-2">Attendance Analytics</h2>
          <p className="text-gray-600">Insights into staff attendance patterns and presence</p>
        </div>
        <button
          onClick={exportAnalyticsToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#BF2C34] text-white rounded-lg hover:bg-[#8f2127] transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Export Analytics</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Attendance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#002E6D]" />
              <span className="text-gray-700">Weekly Attendance</span>
            </div>
          </div>
          <div className="text-[#002E6D] mb-2">
            {weeklyStats.count} / {weeklyStats.total}
          </div>
          <div className="text-gray-600 mb-2">
            <span className="text-[#002E6D]">{weeklyStats.percentage}%</span> of staff
          </div>
          <p className="text-gray-500">Present &ge; 4 days this week</p>
        </div>

        {/* Monthly Attendance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#BF2C34]" />
              <span className="text-gray-700">Monthly Attendance</span>
            </div>
          </div>
          <div className="text-[#BF2C34] mb-2">
            {monthlyStats.count} / {monthlyStats.total}
          </div>
          <div className="text-gray-600 mb-2">
            <span className="text-[#BF2C34]">{monthlyStats.percentage}%</span> of staff
          </div>
          <p className="text-gray-500">Present &ge; 16 days in {monthName}</p>
        </div>

        {/* Average Presence */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Average Daily Presence</span>
            </div>
          </div>
          <div className="text-green-600 mb-2">
            {avgPresence.avgPresence} staff/day
          </div>
          <div className="text-gray-600 mb-2">
            {avgPresence.daysWithData} days tracked
          </div>
          <p className="text-gray-500">Average for {monthName}</p>
        </div>
      </div>

      {/* Monthly Breakdown Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-gray-900 mb-4">Monthly Attendance Summary - {monthName} {currentYear}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-1">Total Staff</p>
            <p className="text-gray-900">{employees.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-1">Staff with Records</p>
            <p className="text-gray-900">{employeeBreakdown.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-1">Total Attendance</p>
            <p className="text-gray-900">{avgPresence.totalRecords}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-1">Days Tracked</p>
            <p className="text-gray-900">{avgPresence.daysWithData}</p>
          </div>
        </div>
      </div>

      {/* Employee Attendance Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#002E6D]" />
            <h3 className="text-gray-900">Individual Employee Attendance - {monthName} {currentYear}</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Rank</th>
                <th className="px-6 py-3 text-left text-gray-700">Employee Name</th>
                <th className="px-6 py-3 text-left text-gray-700">Days Present</th>
                <th className="px-6 py-3 text-left text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employeeBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No attendance records for {monthName} {currentYear}
                  </td>
                </tr>
              ) : (
                employeeBreakdown.map((emp, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{emp.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{emp.daysPresent}</span>
                      <span className="text-gray-500"> days</span>
                    </td>
                    <td className="px-6 py-4">
                      {emp.daysPresent >= 16 ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                          Excellent
                        </span>
                      ) : emp.daysPresent >= 12 ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                          Good
                        </span>
                      ) : emp.daysPresent >= 8 ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                          Fair
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                          Low
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employees with no attendance this month */}
      {employees.length > employeeBreakdown.length && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-gray-900 mb-3">
            Staff with No Attendance Records - {monthName}
          </h3>
          <p className="text-gray-600 mb-4">
            {employees.length - employeeBreakdown.length} employee(s) have not marked attendance this month
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {employees
              .filter(emp => !employeeBreakdown.find(b => b.name === emp.name))
              .map(emp => (
                <div key={emp.id} className="bg-white p-3 rounded border border-yellow-300">
                  <p className="text-gray-900">{emp.name}</p>
                  {emp.email && <p className="text-gray-600">{emp.email}</p>}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}