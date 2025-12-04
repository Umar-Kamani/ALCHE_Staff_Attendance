import { useState } from 'react';
import { AttendanceRecord, Employee } from '../App';
import { Calendar, Filter, Search, Edit2, Trash2, Save, X } from 'lucide-react';

interface AttendanceReportsProps {
  attendanceRecords: AttendanceRecord[];
  employees: Employee[];
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onDeleteAttendance: (id: string) => void;
}

export function AttendanceReports({
  attendanceRecords,
  employees,
  onUpdateAttendance,
  onDeleteAttendance,
}: AttendanceReportsProps) {
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AttendanceRecord>>({});

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesDate = !filterDate || record.date === filterDate;
    const matchesEmployee =
      !filterEmployee ||
      record.employeeId === filterEmployee ||
      record.employeeName.toLowerCase().includes(filterEmployee.toLowerCase());
    return matchesDate && matchesEmployee;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.timeIn.localeCompare(a.timeIn);
  });

  const handleEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditForm(record);
  };

  const handleSave = () => {
    if (editingId && editForm.id) {
      onUpdateAttendance(editForm as AttendanceRecord);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      onDeleteAttendance(id);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label htmlFor="filterEmployee" className="block text-gray-700 mb-2">
              Filter by Employee
            </label>
            <input
              type="text"
              id="filterEmployee"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
              placeholder="Search by name or ID..."
            />
          </div>
        </div>

        {(filterDate || filterEmployee) && (
          <button
            onClick={() => {
              setFilterDate('');
              setFilterEmployee('');
            }}
            className="mt-4 text-[#002E6D] hover:text-[#001d45]"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h2 className="text-gray-900">Attendance Records</h2>
            <span className="ml-auto text-gray-600">
              Showing {sortedRecords.length} records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-gray-700">Employee Name</th>
                <th className="px-6 py-3 text-left text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-gray-700">Time In</th>
                <th className="px-6 py-3 text-left text-gray-700">Time Out</th>
                <th className="px-6 py-3 text-left text-gray-700">Plate Number</th>
                <th className="px-6 py-3 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                sortedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{record.employeeName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          record.isGuest
                            ? 'bg-[#BF2C34] bg-opacity-10 text-[#BF2C34]'
                            : 'bg-[#002E6D] text-white'
                        }`}
                      >
                        {record.isGuest ? 'Guest' : 'Staff'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === record.id ? (
                        <input
                          type="time"
                          value={editForm.timeIn || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, timeIn: e.target.value })
                          }
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-700">{record.timeIn}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === record.id ? (
                        <input
                          type="time"
                          value={editForm.timeOut || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, timeOut: e.target.value })
                          }
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-700">{record.timeOut || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === record.id ? (
                        <input
                          type="text"
                          value={editForm.plateNumber || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, plateNumber: e.target.value })
                          }
                          className="px-2 py-1 border border-gray-300 rounded"
                          placeholder="Plate number"
                        />
                      ) : (
                        <span className="text-gray-700">{record.plateNumber || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === record.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-1 text-[#002E6D] hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1 text-[#BF2C34] hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
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