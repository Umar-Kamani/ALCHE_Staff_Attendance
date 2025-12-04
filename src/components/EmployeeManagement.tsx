import { useState } from 'react';
import { Employee } from '../App';
import { UserPlus, Users, Search } from 'lucide-react';

interface EmployeeManagementProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
}

export function EmployeeManagement({ employees, onAddEmployee }: EmployeeManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [defaultPlateNumber, setDefaultPlateNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for duplicate employee ID
    if (employees.some(emp => emp.employeeId === employeeId)) {
      alert('Employee ID already exists');
      return;
    }

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name: name.trim(),
      employeeId: employeeId.trim(),
      defaultPlateNumber: defaultPlateNumber.trim() || undefined,
    };

    onAddEmployee(newEmployee);
    setName('');
    setEmployeeId('');
    setDefaultPlateNumber('');
    setShowForm(false);
  };

  const filteredEmployees = employees.filter(
    emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-[#002E6D]" />
          <h2 className="text-gray-900">Employee List</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#002E6D] text-white rounded-lg hover:bg-[#001d45] transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Add Employee Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Add New Employee</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="employeeName" className="block text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="employeeName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="employeeId" className="block text-gray-700 mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  id="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                  placeholder="e.g., EMP001"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="defaultPlateNumber" className="block text-gray-700 mb-2">
                Default Vehicle Plate Number (Optional)
              </label>
              <input
                type="text"
                id="defaultPlateNumber"
                value={defaultPlateNumber}
                onChange={(e) => setDefaultPlateNumber(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                placeholder="e.g., ABC-1234"
              />
              <p className="text-gray-500 mt-1">This can be overridden during attendance marking</p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Employee
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setName('');
                  setEmployeeId('');
                  setDefaultPlateNumber('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
            placeholder="Search employees by name or ID..."
          />
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Employee ID</th>
              <th className="px-6 py-3 text-left text-gray-700">Full Name</th>
              <th className="px-6 py-3 text-left text-gray-700">Default Plate Number</th>
              <th className="px-6 py-3 text-left text-gray-700">Date Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'No employees found' : 'No employees added yet'}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{employee.employeeId}</td>
                  <td className="px-6 py-4 text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 text-gray-700">{employee.defaultPlateNumber || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(parseInt(employee.id.split('-')[1])).toLocaleDateString()}
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