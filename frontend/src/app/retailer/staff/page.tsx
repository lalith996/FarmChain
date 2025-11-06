'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  UserGroupIcon,
  UserPlusIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'Manager' | 'Cashier' | 'Stock Clerk' | 'Sales Associate';
  department: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  hireDate: string;
  phone: string;
  hourlyRate: number;
  hoursThisWeek: number;
  performance: number;
}

interface Shift {
  id: string;
  employee: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  status: 'Scheduled' | 'Completed' | 'Missed' | 'Sick Leave';
}

interface Attendance {
  employeeId: string;
  employee: string;
  present: number;
  absent: number;
  late: number;
  rate: number;
}

export default function RetailerStaffPage() {
  const theme = getRoleTheme('RETAILER');
  const [activeTab, setActiveTab] = useState<'employees' | 'schedule' | 'attendance' | 'performance'>('employees');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<'all' | 'Sales' | 'Operations' | 'Management'>('all');

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  const employees: Employee[] = [
    {
      id: 'EMP-001',
      name: 'John Smith',
      email: 'john.smith@store.com',
      role: 'Manager',
      department: 'Management',
      status: 'Active',
      hireDate: '2023-01-15',
      phone: '555-0101',
      hourlyRate: 35.00,
      hoursThisWeek: 40,
      performance: 4.8,
    },
    {
      id: 'EMP-002',
      name: 'Sarah Johnson',
      email: 'sarah.j@store.com',
      role: 'Cashier',
      department: 'Sales',
      status: 'Active',
      hireDate: '2023-06-20',
      phone: '555-0102',
      hourlyRate: 18.50,
      hoursThisWeek: 32,
      performance: 4.5,
    },
    {
      id: 'EMP-003',
      name: 'Mike Davis',
      email: 'mike.d@store.com',
      role: 'Stock Clerk',
      department: 'Operations',
      status: 'Active',
      hireDate: '2024-03-10',
      phone: '555-0103',
      hourlyRate: 16.00,
      hoursThisWeek: 38,
      performance: 4.2,
    },
    {
      id: 'EMP-004',
      name: 'Emily Wilson',
      email: 'emily.w@store.com',
      role: 'Sales Associate',
      department: 'Sales',
      status: 'Active',
      hireDate: '2023-09-05',
      phone: '555-0104',
      hourlyRate: 17.50,
      hoursThisWeek: 35,
      performance: 4.7,
    },
    {
      id: 'EMP-005',
      name: 'David Brown',
      email: 'david.b@store.com',
      role: 'Cashier',
      department: 'Sales',
      status: 'On Leave',
      hireDate: '2024-01-22',
      phone: '555-0105',
      hourlyRate: 18.00,
      hoursThisWeek: 0,
      performance: 4.3,
    },
  ];

  const shifts: Shift[] = [
    {
      id: 'SH-001',
      employee: 'Sarah Johnson',
      role: 'Cashier',
      date: '2025-11-06',
      startTime: '09:00',
      endTime: '17:00',
      hours: 8,
      status: 'Scheduled',
    },
    {
      id: 'SH-002',
      employee: 'Mike Davis',
      role: 'Stock Clerk',
      date: '2025-11-06',
      startTime: '06:00',
      endTime: '14:00',
      hours: 8,
      status: 'Completed',
    },
    {
      id: 'SH-003',
      employee: 'Emily Wilson',
      role: 'Sales Associate',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '18:00',
      hours: 8,
      status: 'Scheduled',
    },
    {
      id: 'SH-004',
      employee: 'John Smith',
      role: 'Manager',
      date: '2025-11-07',
      startTime: '08:00',
      endTime: '16:00',
      hours: 8,
      status: 'Scheduled',
    },
    {
      id: 'SH-005',
      employee: 'David Brown',
      role: 'Cashier',
      date: '2025-11-05',
      startTime: '09:00',
      endTime: '17:00',
      hours: 8,
      status: 'Sick Leave',
    },
  ];

  const attendance: Attendance[] = [
    { employeeId: 'EMP-001', employee: 'John Smith', present: 20, absent: 0, late: 1, rate: 100 },
    { employeeId: 'EMP-002', employee: 'Sarah Johnson', present: 18, absent: 1, late: 2, rate: 94.7 },
    { employeeId: 'EMP-003', employee: 'Mike Davis', present: 19, absent: 0, late: 0, rate: 100 },
    { employeeId: 'EMP-004', employee: 'Emily Wilson', present: 19, absent: 1, late: 1, rate: 95 },
    { employeeId: 'EMP-005', employee: 'David Brown', present: 16, absent: 3, late: 0, rate: 84.2 },
  ];

  const filteredEmployees = selectedDepartment === 'all'
    ? employees
    : employees.filter(e => e.department === selectedDepartment);

  const employeeColumns: Column<Employee>[] = [
    {
      key: 'name',
      label: 'Employee',
      sortable: true,
      render: (emp) => (
        <div>
          <div className="font-semibold text-gray-900">{emp.name}</div>
          <div className="text-xs text-gray-500">{emp.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (emp) => {
        const roleColors = {
          'Manager': 'bg-purple-100 text-purple-800',
          'Cashier': 'bg-blue-100 text-blue-800',
          'Stock Clerk': 'bg-green-100 text-green-800',
          'Sales Associate': 'bg-amber-100 text-amber-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${roleColors[emp.role]}`}>
            {emp.role}
          </span>
        );
      },
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (emp) => (
        <span className="text-sm text-gray-700">{emp.phone}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (emp) => {
        const statusColors = {
          'Active': 'bg-green-100 text-green-800',
          'On Leave': 'bg-yellow-100 text-yellow-800',
          'Inactive': 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[emp.status]}`}>
            {emp.status}
          </span>
        );
      },
    },
    {
      key: 'hourlyRate',
      label: 'Hourly Rate',
      sortable: true,
      render: (emp) => (
        <span className="font-semibold text-gray-900">${emp.hourlyRate.toFixed(2)}</span>
      ),
    },
    {
      key: 'hoursThisWeek',
      label: 'Hours (Week)',
      sortable: true,
      render: (emp) => (
        <span className="text-gray-700">{emp.hoursThisWeek}h</span>
      ),
    },
    {
      key: 'performance',
      label: 'Performance',
      sortable: true,
      render: (emp) => (
        <div className="flex items-center gap-1">
          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-gray-900">{emp.performance}</span>
        </div>
      ),
    },
  ];

  const shiftColumns: Column<Shift>[] = [
    {
      key: 'employee',
      label: 'Employee',
      sortable: true,
      render: (shift) => (
        <div>
          <div className="font-semibold text-gray-900">{shift.employee}</div>
          <div className="text-xs text-gray-500">{shift.role}</div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (shift) => (
        <span className="text-sm text-gray-700">{new Date(shift.date).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'startTime',
      label: 'Start Time',
      sortable: true,
      render: (shift) => (
        <span className="text-gray-700">{shift.startTime}</span>
      ),
    },
    {
      key: 'endTime',
      label: 'End Time',
      sortable: true,
      render: (shift) => (
        <span className="text-gray-700">{shift.endTime}</span>
      ),
    },
    {
      key: 'hours',
      label: 'Hours',
      sortable: true,
      render: (shift) => (
        <span className="font-semibold text-gray-900">{shift.hours}h</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (shift) => {
        const statusConfig = {
          'Scheduled': { color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
          'Completed': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
          'Missed': { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
          'Sick Leave': { color: 'bg-yellow-100 text-yellow-800', icon: XCircleIcon },
        };
        const config = statusConfig[shift.status];
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>
            <Icon className="h-3 w-3" />
            {shift.status}
          </span>
        );
      },
    },
  ];

  const attendanceColumns: Column<Attendance>[] = [
    {
      key: 'employee',
      label: 'Employee',
      sortable: true,
    },
    {
      key: 'present',
      label: 'Present',
      sortable: true,
      render: (att) => (
        <span className="font-semibold text-green-600">{att.present}</span>
      ),
    },
    {
      key: 'absent',
      label: 'Absent',
      sortable: true,
      render: (att) => (
        <span className="font-semibold text-red-600">{att.absent}</span>
      ),
    },
    {
      key: 'late',
      label: 'Late',
      sortable: true,
      render: (att) => (
        <span className="font-semibold text-yellow-600">{att.late}</span>
      ),
    },
    {
      key: 'rate',
      label: 'Attendance Rate',
      sortable: true,
      render: (att) => (
        <div>
          <span className={`font-semibold ${att.rate >= 95 ? 'text-green-600' : att.rate >= 85 ? 'text-yellow-600' : 'text-red-600'}`}>
            {att.rate.toFixed(1)}%
          </span>
          <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full ${att.rate >= 95 ? 'bg-green-500' : att.rate >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${att.rate}%` }}
            />
          </div>
        </div>
      ),
    },
  ];

  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const totalHoursWeek = employees.reduce((sum, e) => sum + e.hoursThisWeek, 0);
  const avgPerformance = employees.reduce((sum, e) => sum + e.performance, 0) / employees.length;
  const estimatedPayroll = employees.reduce((sum, e) => sum + (e.hourlyRate * e.hoursThisWeek), 0);

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage employees, schedules, and performance
            </p>
          </div>
          <button
            onClick={() => setShowAddEmployeeModal(true)}
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <UserPlusIcon className="mb-1 inline h-5 w-5" /> Add Employee
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Employees"
            value={employees.length}
            subtitle={`${activeEmployees} active`}
            icon={UserGroupIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Hours (This Week)"
            value={totalHoursWeek}
            subtitle="Total scheduled"
            icon={ClockIcon}
            gradient="from-blue-500 to-indigo-500"
          />
          <AdvancedStatCard
            title="Avg Performance"
            value={avgPerformance.toFixed(1)}
            subtitle="Out of 5.0"
            icon={StarIcon}
            trend={{ direction: 'up', value: '0.2', label: 'vs last month' }}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Est. Payroll"
            value={`$${estimatedPayroll.toLocaleString()}`}
            subtitle="This week"
            icon={CurrencyDollarIcon}
            gradient="from-purple-500 to-pink-500"
          />
        </StatCardsGrid>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'employees', label: 'Employees', count: employees.length },
            { id: 'schedule', label: 'Schedule', count: shifts.filter(s => s.status === 'Scheduled').length },
            { id: 'attendance', label: 'Attendance' },
            { id: 'performance', label: 'Performance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-amber-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              )}
            </button>
          ))}
        </div>

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            {/* Department Filter */}
            <div className="flex gap-2">
              {['all', 'Sales', 'Operations', 'Management'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept as any)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedDepartment === dept
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {dept === 'all' ? 'All Departments' : dept}
                  {dept !== 'all' && (
                    <span className="ml-2 rounded-full bg-white bg-opacity-30 px-2 py-0.5 text-xs">
                      {employees.filter(e => e.department === dept).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Employees Table */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <AdvancedDataTable
                data={filteredEmployees}
                columns={employeeColumns}
                searchPlaceholder="Search employees by name, role..."
              />
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Weekly Schedule</h3>
                <p className="text-sm text-blue-700">
                  {shifts.filter(s => s.status === 'Scheduled').length} upcoming shifts · {shifts.filter(s => s.status === 'Completed').length} completed
                </p>
              </div>
            </div>

            {/* Shifts Table */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <AdvancedDataTable
                data={shifts}
                columns={shiftColumns}
                searchPlaceholder="Search shifts by employee, date..."
              />
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Perfect Attendance</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                      {attendance.filter(a => a.rate === 100).length}
                    </p>
                  </div>
                  <CheckCircleIcon className="h-12 w-12 text-green-500 opacity-20" />
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Attendance Rate</p>
                    <p className="mt-2 text-3xl font-bold text-blue-600">
                      {(attendance.reduce((sum, a) => sum + a.rate, 0) / attendance.length).toFixed(1)}%
                    </p>
                  </div>
                  <ChartBarIcon className="h-12 w-12 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Absences</p>
                    <p className="mt-2 text-3xl font-bold text-red-600">
                      {attendance.reduce((sum, a) => sum + a.absent, 0)}
                    </p>
                  </div>
                  <XCircleIcon className="h-12 w-12 text-red-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Attendance Records (Last 30 Days)</h2>
              <AdvancedDataTable
                data={attendance}
                columns={attendanceColumns}
                searchPlaceholder="Search by employee name..."
              />
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Employee Performance Ratings</h2>
              <div className="space-y-4">
                {employees
                  .sort((a, b) => b.performance - a.performance)
                  .map((emp, index) => (
                    <div key={emp.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          index < 3 ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gray-200'
                        }`}>
                          <span className={`font-bold ${index < 3 ? 'text-white' : 'text-gray-600'}`}>
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                          <p className="text-sm text-gray-500">{emp.role} · {emp.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-2xl font-bold text-gray-900">{emp.performance}</span>
                          </div>
                          <p className="text-xs text-gray-500">Out of 5.0</p>
                        </div>
                        <button className="rounded-lg border border-amber-500 px-4 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Performance Distribution</h2>
              <div className="space-y-3">
                {[
                  { range: '4.5 - 5.0 (Excellent)', count: 3, color: 'bg-green-500' },
                  { range: '4.0 - 4.4 (Good)', count: 2, color: 'bg-blue-500' },
                  { range: '3.5 - 3.9 (Average)', count: 0, color: 'bg-yellow-500' },
                  { range: 'Below 3.5 (Needs Improvement)', count: 0, color: 'bg-red-500' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{item.range}</span>
                        <span className="text-sm text-gray-600">{item.count} employees</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${(item.count / employees.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddEmployeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
                <button
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                      <option>Cashier</option>
                      <option>Stock Clerk</option>
                      <option>Sales Associate</option>
                      <option>Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                      <option>Sales</option>
                      <option>Operations</option>
                      <option>Management</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                    <input
                      type="date"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddEmployeeModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600">
                    Add Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
