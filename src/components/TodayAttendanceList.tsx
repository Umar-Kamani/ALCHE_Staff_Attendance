import { AttendanceRecord } from '../App';
import { Clock, Car, UserCheck, Users } from 'lucide-react';

interface TodayAttendanceListProps {
  records: AttendanceRecord[];
}

export function TodayAttendanceList({ records }: TodayAttendanceListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-[#002E6D]" />
          <h2 className="text-gray-900">Today's Attendance</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-gray-700">Type</th>
              <th className="px-6 py-3 text-left text-gray-700">Time In</th>
              <th className="px-6 py-3 text-left text-gray-700">Time Out</th>
              <th className="px-6 py-3 text-left text-gray-700">Plate Number</th>
              <th className="px-6 py-3 text-left text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No attendance records for today
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{record.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs text-white ${
                        record.isGuest
                          ? 'bg-[#BF2C34]'
                          : 'bg-[#002E6D]'
                      }`}
                    >
                      {record.isGuest ? 'Guest' : 'Staff'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4" />
                      {record.timeIn}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      {record.timeOut ? (
                        <>
                          <Clock className="w-4 h-4" />
                          {record.timeOut}
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {record.plateNumber ? (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Car className="w-4 h-4" />
                        {record.plateNumber}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {record.timeOut === null ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <UserCheck className="w-4 h-4" />
                        Present
                      </span>
                    ) : (
                      <span className="text-gray-500">Checked Out</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}