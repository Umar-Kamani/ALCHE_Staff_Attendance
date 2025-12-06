import { useState } from 'react';
import { Employee, AttendanceRecord, ParkingConfig } from '../App';
import { CheckCircle, XCircle } from 'lucide-react';

interface AttendanceFormProps {
  type: 'entry' | 'exit' | 'guest' | 'guestExit';
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  parkingConfig: ParkingConfig;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onUpdateParkingConfig: (config: ParkingConfig) => void;
}

export function AttendanceForm({
  type,
  employees,
  attendanceRecords,
  parkingConfig,
  onUpdateAttendance,
  onUpdateParkingConfig,
}: AttendanceFormProps) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedGuest, setSelectedGuest] = useState('');
  const [guestName, setGuestName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [hasCar, setHasCar] = useState(false);
  const [overridePlate, setOverridePlate] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(r => r.date === today);

  // Get active guests for guest exit
  const activeGuests = todayRecords.filter(r => r.isGuest && r.timeOut === null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (type === 'guest') {
      handleGuestEntry();
    } else if (type === 'guestExit') {
      handleGuestExit();
    } else if (type === 'entry') {
      handleEntry();
    } else {
      handleExit();
    }
  };

  // Update plate number when employee is selected
  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    const employee = employees.find(e => e.id === employeeId);
    if (employee && employee.defaultPlateNumber && !overridePlate) {
      setPlateNumber(employee.defaultPlateNumber);
      setHasCar(true);
    } else {
      if (!overridePlate) {
        setPlateNumber('');
        setHasCar(false);
      }
    }
  };

  const handleEntry = () => {
    if (!selectedEmployee) {
      setMessage({ type: 'error', text: 'Please select an employee' });
      return;
    }

    const employee = employees.find(e => e.id === selectedEmployee);
    if (!employee) return;

    // Check if there's an existing record for today
    const existingRecord = todayRecords.find(
      r => r.employeeId === employee.id && !r.isGuest
    );

    // Check parking availability (only if bringing a car and no existing record with car)
    if (hasCar && plateNumber) {
      const needsNewParkingSpace = !existingRecord || !existingRecord.plateNumber;
      if (needsNewParkingSpace && parkingConfig.occupiedSpaces >= parkingConfig.totalSpaces) {
        setMessage({ type: 'error', text: 'No parking spaces available' });
        return;
      }
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });

    if (existingRecord) {
      // Employee already has a record for today - just update timeOut to null (re-entry)
      const updatedRecord: AttendanceRecord = {
        ...existingRecord,
        timeOut: null,
        // Update plate number if changed
        plateNumber: hasCar && plateNumber ? plateNumber : existingRecord.plateNumber,
      };

      onUpdateAttendance(updatedRecord);

      // Update parking if car status changed
      if (hasCar && plateNumber && !existingRecord.plateNumber) {
        onUpdateParkingConfig({
          ...parkingConfig,
          occupiedSpaces: parkingConfig.occupiedSpaces + 1,
        });
      }

      setMessage({ type: 'success', text: `Re-entry marked for ${employee.name}` });
    } else {
      // First entry of the day - create new record
      const record: AttendanceRecord = {
        id: `${employee.id}-${Date.now()}`,
        employeeId: employee.id,
        employeeName: employee.name,
        date: today,
        timeIn: timeString,
        timeOut: null,
        plateNumber: hasCar && plateNumber ? plateNumber : null,
        isGuest: false,
      };

      onUpdateAttendance(record);

      // Update parking
      if (hasCar && plateNumber) {
        onUpdateParkingConfig({
          ...parkingConfig,
          occupiedSpaces: parkingConfig.occupiedSpaces + 1,
        });
      }

      setMessage({ type: 'success', text: `Entry marked for ${employee.name}` });
    }

    setSelectedEmployee('');
    setSearchTerm('');
    setPlateNumber('');
    setHasCar(false);
  };

  const handleExit = () => {
    if (!selectedEmployee) {
      setMessage({ type: 'error', text: 'Please select an employee' });
      return;
    }

    const employee = employees.find(e => e.id === selectedEmployee);
    if (!employee) return;

    const existingRecord = todayRecords.find(
      r => r.employeeId === employee.id && r.timeOut === null && !r.isGuest
    );

    if (!existingRecord) {
      setMessage({ type: 'error', text: 'No active entry found for this employee' });
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });

    const updatedRecord: AttendanceRecord = {
      ...existingRecord,
      timeOut: timeString,
    };

    onUpdateAttendance(updatedRecord);

    // Update parking
    if (existingRecord.plateNumber) {
      onUpdateParkingConfig({
        ...parkingConfig,
        occupiedSpaces: Math.max(0, parkingConfig.occupiedSpaces - 1),
      });
    }

    setMessage({ type: 'success', text: `Exit marked for ${employee.name}` });
    setSelectedEmployee('');
    setSearchTerm('');
  };

  const handleGuestEntry = () => {
    if (!guestName.trim()) {
      setMessage({ type: 'error', text: 'Please enter guest name' });
      return;
    }

    // Check parking availability
    if (hasCar && plateNumber) {
      if (parkingConfig.occupiedSpaces >= parkingConfig.totalSpaces) {
        setMessage({ type: 'error', text: 'No parking spaces available' });
        return;
      }
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });

    const record: AttendanceRecord = {
      id: `guest-${Date.now()}`,
      employeeId: `guest-${Date.now()}`,
      employeeName: guestName,
      date: today,
      timeIn: timeString,
      timeOut: null,
      plateNumber: hasCar && plateNumber ? plateNumber : null,
      isGuest: true,
    };

    onUpdateAttendance(record);

    // Update parking
    if (hasCar && plateNumber) {
      onUpdateParkingConfig({
        ...parkingConfig,
        occupiedSpaces: parkingConfig.occupiedSpaces + 1,
      });
    }

    setMessage({ type: 'success', text: `Guest entry marked for ${guestName}` });
    setGuestName('');
    setPlateNumber('');
    setHasCar(false);
  };

  const handleGuestExit = () => {
    if (!selectedGuest) {
      setMessage({ type: 'error', text: 'Please select a guest' });
      return;
    }

    const existingRecord = attendanceRecords.find(r => r.id === selectedGuest);

    if (!existingRecord) {
      setMessage({ type: 'error', text: 'Guest record not found' });
      return;
    }

    if (existingRecord.timeOut !== null) {
      setMessage({ type: 'error', text: 'Guest has already checked out' });
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });

    const updatedRecord: AttendanceRecord = {
      ...existingRecord,
      timeOut: timeString,
    };

    onUpdateAttendance(updatedRecord);

    // Update parking
    if (existingRecord.plateNumber) {
      onUpdateParkingConfig({
        ...parkingConfig,
        occupiedSpaces: Math.max(0, parkingConfig.occupiedSpaces - 1),
      });
    }

    setMessage({ type: 'success', text: `Exit marked for ${existingRecord.employeeName}` });
    setSelectedGuest('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    setSelectedEmployee('');
  };

  const handleEmployeeSelect = (employee: Employee) => {
    handleEmployeeChange(employee.id);
    setSearchTerm(employee.name);
    setShowDropdown(false);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === 'guest' ? (
        <div>
          <label htmlFor="guestName" className="block text-gray-700 mb-2">
            Guest Name
          </label>
          <input
            type="text"
            id="guestName"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter guest name"
            required
          />
        </div>
      ) : type === 'guestExit' ? (
        <div>
          <label htmlFor="guestSelect" className="block text-gray-700 mb-2">
            Select Guest
          </label>
          <select
            id="guestSelect"
            value={selectedGuest}
            onChange={(e) => setSelectedGuest(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
            required
          >
            <option value="">Choose a guest...</option>
            {activeGuests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.employeeName} - {guest.timeIn} {guest.plateNumber ? `(${guest.plateNumber})` : ''}
              </option>
            ))}
          </select>
          {activeGuests.length === 0 && (
            <p className="text-gray-500 mt-2">No active guests</p>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="employee" className="block text-gray-700 mb-2">
            Select Employee
          </label>
          <div className="relative">
            <input
              type="text"
              id="employee"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Choose an employee..."
              required
            />
            {showDropdown && filteredEmployees.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleEmployeeSelect(emp)}
                  >
                    {emp.name} ({emp.employeeId}) {emp.defaultPlateNumber ? `- ${emp.defaultPlateNumber}` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {(type === 'entry' || type === 'guest') && (
        <>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasCar"
              checked={hasCar}
              onChange={(e) => {
                setHasCar(e.target.checked);
                if (!e.target.checked) {
                  setPlateNumber('');
                  setOverridePlate(false);
                }
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasCar" className="text-gray-700">
              Arrived by car
            </label>
          </div>

          {hasCar && (
            <>
              {type === 'entry' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="overridePlate"
                    checked={overridePlate}
                    onChange={(e) => {
                      setOverridePlate(e.target.checked);
                      if (!e.target.checked) {
                        const employee = employees.find(emp => emp.id === selectedEmployee);
                        if (employee?.defaultPlateNumber) {
                          setPlateNumber(employee.defaultPlateNumber);
                        }
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="overridePlate" className="text-gray-700">
                    Use different plate number
                  </label>
                </div>
              )}
              <div>
                <label htmlFor="plateNumber" className="block text-gray-700 mb-2">
                  Plate Number
                </label>
                <input
                  type="text"
                  id="plateNumber"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                  placeholder="e.g., ABC-1234"
                  required={hasCar}
                  disabled={type === 'entry' && !overridePlate && selectedEmployee && employees.find(e => e.id === selectedEmployee)?.defaultPlateNumber !== undefined}
                />
              </div>
            </>
          )}
        </>
      )}

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-[#002E6D] text-white py-3 rounded-lg hover:bg-[#001d45] transition-colors"
      >
        {type === 'entry' ? 'Mark Entry' : type === 'exit' ? 'Mark Exit' : type === 'guest' ? 'Register Guest' : 'Mark Guest Exit'}
      </button>
    </form>
  );
}