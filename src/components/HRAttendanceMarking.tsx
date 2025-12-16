import { useState } from 'react';
import { Employee, AttendanceRecord, ParkingConfig } from '../App';
import { AttendanceForm } from './AttendanceForm';

interface HRAttendanceMarkingProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  parkingConfig: ParkingConfig;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onUpdateParkingConfig: (config: ParkingConfig) => void;
}

export function HRAttendanceMarking({
  employees,
  attendanceRecords,
  parkingConfig,
  onUpdateAttendance,
  onUpdateParkingConfig,
}: HRAttendanceMarkingProps) {
  const [activeSubTab, setActiveSubTab] = useState<'entry' | 'exit' | 'guest' | 'guestExit'>('entry');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Sub-tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex min-w-max">
          <button
            onClick={() => setActiveSubTab('entry')}
            className={`flex-1 px-4 sm:px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'entry'
                ? 'border-[#002E6D] text-[#002E6D]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Staff Entry
          </button>
          <button
            onClick={() => setActiveSubTab('exit')}
            className={`flex-1 px-4 sm:px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'exit'
                ? 'border-[#002E6D] text-[#002E6D]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Staff Exit
          </button>
          <button
            onClick={() => setActiveSubTab('guest')}
            className={`flex-1 px-4 sm:px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'guest'
                ? 'border-[#002E6D] text-[#002E6D]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Guest Entry
          </button>
          <button
            onClick={() => setActiveSubTab('guestExit')}
            className={`flex-1 px-4 sm:px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'guestExit'
                ? 'border-[#002E6D] text-[#002E6D]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Guest Exit
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <AttendanceForm
          type={activeSubTab}
          employees={employees}
          attendanceRecords={attendanceRecords}
          parkingConfig={parkingConfig}
          onUpdateAttendance={onUpdateAttendance}
          onUpdateParkingConfig={onUpdateParkingConfig}
        />
      </div>
    </div>
  );
}
