import { useState } from 'react';
import { Employee, AttendanceRecord, ParkingConfig } from '../App';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface AttendanceFormProps {
  type: 'entry' | 'exit' | 'guest' | 'guestExit';
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  parkingConfig: ParkingConfig;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onUpdateParkingConfig: (config: ParkingConfig) => void;
}

interface SelectedEmployee {
  id: string;
  employee: Employee | null;
  searchTerm: string;
  showDropdown: boolean;
  hasCar: boolean;
  plateNumber: string;
  overridePlate: boolean;
}

export function AttendanceForm({
  type,
  employees,
  attendanceRecords,
  parkingConfig,
  onUpdateAttendance,
  onUpdateParkingConfig,
}: AttendanceFormProps) {
  const [selectedEmployees, setSelectedEmployees] = useState<SelectedEmployee[]>([{
    id: Date.now().toString(),
    employee: null,
    searchTerm: '',
    showDropdown: false,
    hasCar: false,
    plateNumber: '',
    overridePlate: false,
  }]);
  const [addAdditional, setAddAdditional] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestHasCar, setGuestHasCar] = useState(false);
  const [guestPlateNumber, setGuestPlateNumber] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      handleBulkEntry();
    } else {
      handleBulkExit();
    }
  };

  const handleAddEmployee = () => {
    setSelectedEmployees([...selectedEmployees, {
      id: Date.now().toString(),
      employee: null,
      searchTerm: '',
      showDropdown: false,
      hasCar: false,
      plateNumber: '',
      overridePlate: false,
    }]);
  };

  const handleRemoveEmployee = (id: string) => {
    if (selectedEmployees.length > 1) {
      setSelectedEmployees(selectedEmployees.filter(se => se.id !== id));
    }
  };

  const handleEmployeeSelect = (index: number, employee: Employee) => {
    const updated = [...selectedEmployees];
    updated[index] = {
      ...updated[index],
      employee: employee,
      searchTerm: employee.name,
      showDropdown: false,
      hasCar: !!employee.defaultPlateNumber,
      plateNumber: employee.defaultPlateNumber || '',
    };
    setSelectedEmployees(updated);
  };

  const handleSearchChange = (index: number, value: string) => {
    const updated = [...selectedEmployees];
    updated[index] = {
      ...updated[index],
      searchTerm: value,
      showDropdown: true,
      employee: null,
    };
    setSelectedEmployees(updated);
  };

  const handleToggleCar = (index: number) => {
    const updated = [...selectedEmployees];
    updated[index] = {
      ...updated[index],
      hasCar: !updated[index].hasCar,
      plateNumber: !updated[index].hasCar ? (updated[index].employee?.defaultPlateNumber || '') : '',
      overridePlate: false,
    };
    setSelectedEmployees(updated);
  };

  const handleToggleOverride = (index: number) => {
    const updated = [...selectedEmployees];
    updated[index] = {
      ...updated[index],
      overridePlate: !updated[index].overridePlate,
      plateNumber: !updated[index].overridePlate ? updated[index].plateNumber : (updated[index].employee?.defaultPlateNumber || ''),
    };
    setSelectedEmployees(updated);
  };

  const handlePlateChange = (index: number, value: string) => {
    const updated = [...selectedEmployees];
    updated[index] = {
      ...updated[index],
      plateNumber: value.toUpperCase(),
    };
    setSelectedEmployees(updated);
  };

  const handleBulkEntry = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    let parkingSpacesNeeded = 0;
    let successCount = 0;
    let failedEmployees: string[] = [];

    // Validate all employees are selected
    for (const se of selectedEmployees) {
      if (!se.employee) {
        setMessage({ type: 'error', text: 'Please select all employees' });
        return;
      }
      // Validate plate number if bringing car
      if (se.hasCar && !se.plateNumber.trim()) {
        setMessage({ type: 'error', text: `${se.employee.name} is missing plate number` });
        return;
      }
    }

    // Calculate parking spaces needed
    selectedEmployees.forEach(se => {
      if (se.hasCar && se.plateNumber && se.employee) {
        const existingRecord = todayRecords.find(
          r => r.employeeId === se.employee!.id && !r.isGuest
        );
        if (!existingRecord || !existingRecord.plateNumber) {
          parkingSpacesNeeded++;
        }
      }
    });

    // Check parking availability
    const availableSpaces = parkingConfig.totalSpaces - parkingConfig.occupiedSpaces;
    if (parkingSpacesNeeded > availableSpaces) {
      setMessage({ 
        type: 'error', 
        text: `Not enough parking spaces. Need ${parkingSpacesNeeded}, only ${availableSpaces} available` 
      });
      return;
    }

    // Process each employee
    selectedEmployees.forEach(se => {
      if (!se.employee) return;

      const existingRecord = todayRecords.find(
        r => r.employeeId === se.employee!.id && !r.isGuest
      );

      if (existingRecord) {
        // Update existing record
        const updatedRecord: AttendanceRecord = {
          ...existingRecord,
          timeOut: null,
          plateNumber: se.hasCar && se.plateNumber ? se.plateNumber : existingRecord.plateNumber,
        };
        onUpdateAttendance(updatedRecord);
      } else {
        // Create new record
        const record: AttendanceRecord = {
          id: `${se.employee.id}-${Date.now()}-${Math.random()}`,
          employeeId: se.employee.id,
          employeeName: se.employee.name,
          date: today,
          timeIn: timeString,
          timeOut: null,
          plateNumber: se.hasCar && se.plateNumber ? se.plateNumber : null,
          isGuest: false,
        };
        onUpdateAttendance(record);
      }
      successCount++;
    });

    // Update parking
    if (parkingSpacesNeeded > 0) {
      onUpdateParkingConfig({
        ...parkingConfig,
        occupiedSpaces: parkingConfig.occupiedSpaces + parkingSpacesNeeded,
      });
    }

    setMessage({ type: 'success', text: `Successfully marked entry for ${successCount} employee(s)` });
    
    // Reset form
    setSelectedEmployees([{
      id: Date.now().toString(),
      employee: null,
      searchTerm: '',
      showDropdown: false,
      hasCar: false,
      plateNumber: '',
      overridePlate: false,
    }]);
    setAddAdditional(false);
  };

  const handleBulkExit = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    let successCount = 0;
    let failedEmployees: string[] = [];
    let parkingSpacesFreed = 0;

    // Validate all employees are selected
    for (const se of selectedEmployees) {
      if (!se.employee) {
        setMessage({ type: 'error', text: 'Please select all employees' });
        return;
      }
    }

    selectedEmployees.forEach(se => {
      if (!se.employee) return;

      const existingRecord = todayRecords.find(
        r => r.employeeId === se.employee!.id && r.timeOut === null && !r.isGuest
      );

      if (!existingRecord) {
        failedEmployees.push(`${se.employee.name} (no active entry)`);
        return;
      }

      const updatedRecord: AttendanceRecord = {
        ...existingRecord,
        timeOut: timeString,
      };

      onUpdateAttendance(updatedRecord);

      if (existingRecord.plateNumber) {
        parkingSpacesFreed++;
      }

      successCount++;
    });

    // Update parking
    if (parkingSpacesFreed > 0) {
      onUpdateParkingConfig({
        ...parkingConfig,
        occupiedSpaces: Math.max(0, parkingConfig.occupiedSpaces - parkingSpacesFreed),
      });
    }

    if (failedEmployees.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `${successCount} exit(s) marked. Failed: ${failedEmployees.join(', ')}` 
      });
    } else {
      setMessage({ type: 'success', text: `Successfully marked exit for ${successCount} employee(s)` });
    }

    // Reset form
    setSelectedEmployees([{
      id: Date.now().toString(),
      employee: null,
      searchTerm: '',
      showDropdown: false,
      hasCar: false,
      plateNumber: '',
      overridePlate: false,
    }]);
    setAddAdditional(false);
  };

  const handleGuestEntry = () => {
    if (!guestName.trim()) {
      setMessage({ type: 'error', text: 'Please enter guest name' });
      return;
    }

    // Check parking availability
    if (guestHasCar && guestPlateNumber) {
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
      plateNumber: guestHasCar && guestPlateNumber ? guestPlateNumber : null,
      isGuest: true,
    };

    onUpdateAttendance(record);

    // Update parking
    if (guestHasCar && guestPlateNumber) {
      onUpdateParkingConfig({
        ...parkingConfig,
        occupiedSpaces: parkingConfig.occupiedSpaces + 1,
      });
    }

    setMessage({ type: 'success', text: `Guest entry marked for ${guestName}` });
    setGuestName('');
    setGuestPlateNumber('');
    setGuestHasCar(false);
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

  const getFilteredEmployees = (index: number) => {
    const selectedIds = selectedEmployees
      .filter((_, i) => i !== index)
      .map(se => se.employee?.id)
      .filter(Boolean);
    
    return employees.filter(emp =>
      emp.name.toLowerCase().includes(selectedEmployees[index].searchTerm.toLowerCase()) &&
      !selectedIds.includes(emp.id)
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === 'guest' ? (
        <>
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="guestHasCar"
              checked={guestHasCar}
              onChange={(e) => {
                setGuestHasCar(e.target.checked);
                if (!e.target.checked) setGuestPlateNumber('');
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="guestHasCar" className="text-gray-700">
              Arrived by car
            </label>
          </div>
          {guestHasCar && (
            <div>
              <label htmlFor="guestPlateNumber" className="block text-gray-700 mb-2">
                Plate Number
              </label>
              <input
                type="text"
                id="guestPlateNumber"
                value={guestPlateNumber}
                onChange={(e) => setGuestPlateNumber(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                placeholder="e.g., ABC-1234"
                required={guestHasCar}
              />
            </div>
          )}
        </>
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
        <>
          {selectedEmployees.map((se, index) => {
            const filteredEmployees = getFilteredEmployees(index);
            
            return (
              <div key={se.id} className={`${index > 0 ? 'border-t border-gray-200 pt-4' : ''}`}>
                {index > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Additional Employee {index}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmployee(se.id)}
                      className="text-[#BF2C34] hover:bg-red-50 p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor={`employee-${index}`} className="block text-gray-700 mb-2">
                      {index === 0 ? 'Select Employee' : 'Employee Name'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id={`employee-${index}`}
                        value={se.searchTerm}
                        onChange={(e) => handleSearchChange(index, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Choose an employee..."
                        required
                      />
                      {se.showDropdown && filteredEmployees.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-lg shadow-lg max-h-40 overflow-y-auto">
                          {filteredEmployees.map((emp) => (
                            <div
                              key={emp.id}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleEmployeeSelect(index, emp)}
                            >
                              {emp.name} {emp.defaultPlateNumber ? `- ${emp.defaultPlateNumber}` : ''}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {type === 'entry' && (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`hasCar-${index}`}
                          checked={se.hasCar}
                          onChange={() => handleToggleCar(index)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`hasCar-${index}`} className="text-gray-700">
                          Arrived by car
                        </label>
                      </div>

                      {se.hasCar && (
                        <>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`overridePlate-${index}`}
                              checked={se.overridePlate}
                              onChange={() => handleToggleOverride(index)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`overridePlate-${index}`} className="text-gray-700">
                              Use different plate number
                            </label>
                          </div>
                          <div>
                            <label htmlFor={`plateNumber-${index}`} className="block text-gray-700 mb-2">
                              Plate Number
                            </label>
                            <input
                              type="text"
                              id={`plateNumber-${index}`}
                              value={se.plateNumber}
                              onChange={(e) => handlePlateChange(index, e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                              placeholder="e.g., ABC-1234"
                              required={se.hasCar}
                              disabled={!se.overridePlate && se.employee?.defaultPlateNumber !== undefined}
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {(type === 'entry' || type === 'exit') && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="addAdditional"
                checked={addAdditional}
                onChange={(e) => {
                  setAddAdditional(e.target.checked);
                  if (e.target.checked && selectedEmployees.length === 1) {
                    handleAddEmployee();
                  } else if (!e.target.checked && selectedEmployees.length > 1) {
                    setSelectedEmployees([selectedEmployees[0]]);
                  }
                }}
                className="w-4 h-4 text-[#002E6D] border-gray-300 rounded focus:ring-[#002E6D]"
              />
              <label htmlFor="addAdditional" className="text-gray-700">
                Add additional employee
              </label>
            </div>
          )}

          {addAdditional && selectedEmployees.length > 0 && (
            <button
              type="button"
              onClick={handleAddEmployee}
              className="w-full py-2 border-2 border-dashed border-[#002E6D] text-[#002E6D] rounded-lg hover:bg-blue-50 transition-colors"
            >
              + Add Another Employee
            </button>
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
        {type === 'entry' 
          ? `Mark Staff Entry${selectedEmployees.length > 1 ? ` (${selectedEmployees.length})` : ''}` 
          : type === 'exit' 
          ? `Mark Staff Exit${selectedEmployees.length > 1 ? ` (${selectedEmployees.length})` : ''}` 
          : type === 'guest' 
          ? 'Register Guest' 
          : 'Mark Guest Exit'
        }
      </button>
    </form>
  );
}
