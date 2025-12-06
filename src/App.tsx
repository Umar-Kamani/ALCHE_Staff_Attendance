import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { SecurityGuardDashboard } from './components/SecurityGuardDashboard';
import { HRDashboard } from './components/HRDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { DeanDashboard } from './components/DeanDashboard';

// App version
export const APP_VERSION = '1.0.0';

export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  email?: string;
  defaultPlateNumber?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  plateNumber: string | null;
  isGuest: boolean;
}

export interface ParkingConfig {
  totalSpaces: number;
  occupiedSpaces: number;
}

export interface User {
  username: string;
  role: 'security' | 'hr' | 'superadmin' | 'dean';
  password?: string;
  id?: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  username: string;
  action: 'login' | 'logout';
  timestamp: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [parkingConfig, setParkingConfig] = useState<ParkingConfig>({ totalSpaces: 50, occupiedSpaces: 0 });
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);

  // Initialize default super admin and demo users
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      // Check if dean user exists, if not add it
      const deanExists = parsedUsers.some((u: User) => u.role === 'dean');
      if (!deanExists) {
        const updatedUsers = [
          ...parsedUsers,
          { id: 'dean-1', username: 'dean', password: 'dean123', role: 'dean' },
        ];
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      } else {
        setUsers(parsedUsers);
      }
    } else {
      // Create default super admin and demo users
      const defaultUsers: User[] = [
        { id: 'super-1', username: 'admin', password: 'admin123', role: 'superadmin' },
        { id: 'sec-1', username: 'security', password: 'security123', role: 'security' },
        { id: 'hr-1', username: 'hr', password: 'hr123', role: 'hr' },
        { id: 'dean-1', username: 'dean', password: 'dean123', role: 'dean' },
      ];
      setUsers(defaultUsers);
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees');
    const savedAttendance = localStorage.getItem('attendanceRecords');
    const savedParking = localStorage.getItem('parkingConfig');
    const savedUser = localStorage.getItem('currentUser');
    const savedAccessLogs = localStorage.getItem('accessLogs');

    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
    if (savedAttendance) setAttendanceRecords(JSON.parse(savedAttendance));
    if (savedParking) setParkingConfig(JSON.parse(savedParking));
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedAccessLogs) setAccessLogs(JSON.parse(savedAccessLogs));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('parkingConfig', JSON.stringify(parkingConfig));
  }, [parkingConfig]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('accessLogs', JSON.stringify(accessLogs));
  }, [accessLogs]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const newLog: AccessLog = {
      id: Date.now().toString(),
      userId: user.id!,
      username: user.username,
      action: 'login',
      timestamp: new Date().toISOString(),
    };
    setAccessLogs([...accessLogs, newLog]);
  };

  const handleLogout = () => {
    if (currentUser) {
      const newLog: AccessLog = {
        id: Date.now().toString(),
        userId: currentUser.id!,
        username: currentUser.username,
        action: 'logout',
        timestamp: new Date().toISOString(),
      };
      setAccessLogs([...accessLogs, newLog]);
    }
    setCurrentUser(null);
  };

  const addEmployee = (employee: Employee) => {
    setEmployees([...employees, employee]);
  };

  const addUser = (user: User) => {
    setUsers([...users, user]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If updating current user's password, update current user session
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const updateAttendance = (record: AttendanceRecord) => {
    const existingIndex = attendanceRecords.findIndex(r => r.id === record.id);
    if (existingIndex >= 0) {
      const updated = [...attendanceRecords];
      updated[existingIndex] = record;
      setAttendanceRecords(updated);
    } else {
      setAttendanceRecords([...attendanceRecords, record]);
    }
  };

  const deleteAttendanceRecord = (id: string) => {
    setAttendanceRecords(attendanceRecords.filter(r => r.id !== id));
  };

  const updateParkingConfig = (config: ParkingConfig) => {
    setParkingConfig(config);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} users={users} />;
  }

  if (currentUser.role === 'superadmin') {
    return (
      <SuperAdminDashboard
        user={currentUser}
        users={users}
        employees={employees}
        attendanceRecords={attendanceRecords}
        parkingConfig={parkingConfig}
        accessLogs={accessLogs}
        onLogout={handleLogout}
        onAddUser={addUser}
        onUpdateUser={updateUser}
        onDeleteUser={deleteUser}
      />
    );
  }

  if (currentUser.role === 'security') {
    return (
      <SecurityGuardDashboard
        user={currentUser}
        employees={employees}
        attendanceRecords={attendanceRecords}
        parkingConfig={parkingConfig}
        onLogout={handleLogout}
        onUpdateAttendance={updateAttendance}
        onUpdateParkingConfig={updateParkingConfig}
      />
    );
  }

  if (currentUser.role === 'dean') {
    return (
      <DeanDashboard
        user={currentUser}
        employees={employees}
        attendanceRecords={attendanceRecords}
        parkingConfig={parkingConfig}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <HRDashboard
      user={currentUser}
      employees={employees}
      attendanceRecords={attendanceRecords}
      parkingConfig={parkingConfig}
      onLogout={handleLogout}
      onAddEmployee={addEmployee}
      onUpdateAttendance={updateAttendance}
      onDeleteAttendance={deleteAttendanceRecord}
    />
  );
}