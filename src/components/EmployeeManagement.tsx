import { useState } from 'react';
import { Employee } from '../App';
import { UserPlus, Users, Search, Upload, Trash2, Edit2 } from 'lucide-react';

interface EmployeeManagementProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onUpdateEmployee: (employee: Employee) => void;
}

export function EmployeeManagement({ employees, onAddEmployee, onDeleteEmployee, onUpdateEmployee }: EmployeeManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [defaultPlateNumber, setDefaultPlateNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || undefined,
      defaultPlateNumber: defaultPlateNumber.trim() || undefined,
    };

    onAddEmployee(newEmployee);
    setName('');
    setEmail('');
    setDefaultPlateNumber('');
    setShowForm(false);
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.getElementById('bulkImportFile') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      alert('Please select a file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      
      // Skip header row
      const dataLines = lines.slice(1);
      let importedCount = 0;
      let skippedCount = 0;

      dataLines.forEach(line => {
        if (!line.trim()) return;

        const [empName, empEmail, empPlate] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        
        // Skip if employee ID already exists
        if (employees.some(emp => emp.name === empName)) {
          skippedCount++;
          return;
        }

        if (empName) {
          const newEmployee: Employee = {
            id: `emp-${Date.now()}-${importedCount}`,
            name: empName,
            email: empEmail || undefined,
            defaultPlateNumber: empPlate || undefined,
          };
          onAddEmployee(newEmployee);
          importedCount++;
        }
      });

      alert(`Import complete!\nImported: ${importedCount} employees\nSkipped (duplicates): ${skippedCount} employees`);
      setShowBulkImport(false);
      fileInput.value = '';
    };

    reader.readAsText(file);
  };

  const filteredEmployees = employees.filter(
    emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-[#002E6D]" />
          <h2 className="text-gray-900">Employee List</h2>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#002E6D] text-white rounded-lg hover:bg-[#001d45] transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Employee</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="flex items-center gap-2 px-4 py-2 bg-[#002E6D] text-white rounded-lg hover:bg-[#001d45] transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Bulk Import</span>
            <span className="sm:hidden">Import</span>
          </button>
        </div>
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
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                placeholder="e.g., john.doe@example.com"
              />
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
                className="flex-1 bg-[rgb(0,46,109)] text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Employee
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setName('');
                  setEmail('');
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

      {/* Bulk Import Form */}
      {showBulkImport && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Bulk Import Employees</h3>
          <form onSubmit={handleBulkImport} className="space-y-4">
            <div>
              <label htmlFor="bulkImportFile" className="block text-gray-700 mb-2">
                Upload CSV File
              </label>
              <input
                type="file"
                id="bulkImportFile"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                accept=".csv"
              />
              <p className="text-gray-500 mt-1">CSV file should have columns: Full Name, Email, Default Plate Number</p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-[rgb(0,46,109)] text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Import Employees
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkImport(false);
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Full Name</th>
              <th className="px-6 py-3 text-left text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-gray-700">Default Plate Number</th>
              <th className="px-6 py-3 text-left text-gray-700">Date Added</th>
              <th className="px-6 py-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'No employees found' : 'No employees added yet'}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 text-gray-700">{employee.email || '-'}</td>
                  <td className="px-6 py-4 text-gray-700">{employee.defaultPlateNumber || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(parseInt(employee.id.split('-')[1])).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingEmployee(employee);
                          setName(employee.name);
                          setEmail(employee.email || '');
                          setDefaultPlateNumber(employee.defaultPlateNumber || '');
                        }}
                        className="text-[#002E6D] hover:text-[#001d45]"
                        title="Edit Employee"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEmployeeToDelete(employee);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-gray-900 mb-4">Edit Employee</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                
                const updatedEmployee: Employee = {
                  ...editingEmployee,
                  name: name.trim(),
                  email: email.trim() || undefined,
                  defaultPlateNumber: defaultPlateNumber.trim() || undefined,
                };

                onUpdateEmployee(updatedEmployee);
                setEditingEmployee(null);
                setName('');
                setEmail('');
                setDefaultPlateNumber('');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editEmployeeName" className="block text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="editEmployeeName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="editEmail" className="block text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="editEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                  placeholder="e.g., john.doe@example.com"
                />
              </div>

              <div>
                <label htmlFor="editDefaultPlateNumber" className="block text-gray-700 mb-2">
                  Default Vehicle Plate Number (Optional)
                </label>
                <input
                  type="text"
                  id="editDefaultPlateNumber"
                  value={defaultPlateNumber}
                  onChange={(e) => setDefaultPlateNumber(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
                  placeholder="e.g., ABC-1234"
                />
                <p className="text-gray-500 mt-1">This can be overridden during attendance marking</p>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#002E6D] text-white py-2 rounded-lg hover:bg-[#001d45] transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEmployee(null);
                    setName('');
                    setEmail('');
                    setDefaultPlateNumber('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && employeeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete employee <strong>{employeeToDelete.name}</strong>?
            </p>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDeleteEmployee(employeeToDelete.id);
                  setShowDeleteConfirm(false);
                  setEmployeeToDelete(null);
                }}
                className="flex-1 bg-[#BF2C34] text-white py-2 rounded-lg hover:bg-[#8f2127] transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEmployeeToDelete(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}