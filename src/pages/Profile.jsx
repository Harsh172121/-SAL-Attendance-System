/**
 * SAL Education - College Attendance Management System
 * Profile Page
 * Displays and allows editing of user profile information
 * Common page accessible by all authenticated users
 */

import { useState } from 'react';
import { Card, Button } from '../components';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { formatTeacherDepartments } from '../utils/teacherDepartments';

const Profile = () => {
  // Get user data and update function from auth context
  const { user, updateProfile } = useAuth();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '9876543210',
    address: user?.address || 'Ahmedabad, Gujarat, India',
  });

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  /**
   * Get role-specific information
   */
  const getRoleInfo = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { label: 'Role', value: 'Administrator' },
          { label: 'Department', value: 'Administration' },
          { label: 'Access Level', value: 'Full Access' },
        ];
      case 'teacher':
        return [
          { label: 'Employee ID', value: 'SAL-T001' },
          { label: 'Departments', value: formatTeacherDepartments(user) },
          { label: 'Designation', value: 'Professor' },
          { label: 'Subjects', value: '4 Assigned' },
        ];
      case 'student':
        return [
          { label: 'Enrollment No', value: user?.enrollmentNo || 'SAL2024001' },
          { label: 'Department', value: user?.department || 'Computer Engineering' },
          { label: 'Semester', value: user?.semester || '5' },
          { label: 'Section', value: 'A' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600">View and manage your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            {/* Avatar */}
            <div className="w-24 h-24 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Name and role */}
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 capitalize">{user?.role}</p>
            <p className="text-sm text-blue-600 mt-1">{user?.email}</p>

            {/* Status badge */}
            <div className="mt-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active Account
              </span>
            </div>

            {/* Quick stats for student */}
            {user?.role === 'student' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">87%</p>
                    <p className="text-xs text-gray-500">Attendance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">6</p>
                    <p className="text-xs text-gray-500">Subjects</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick stats for teacher */}
            {user?.role === 'teacher' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">156</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">4</p>
                    <p className="text-xs text-gray-500">Subjects</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Profile details */}
        <Card title="Profile Details" className="lg:col-span-2">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              {/* Personal information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-800">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-800">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-800">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-800">{formData.address}</p>
                  </div>
                </div>
              </div>

              {/* Role-specific information */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {user?.role === 'student' ? 'Academic' : 'Professional'} Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getRoleInfo().map((info, index) => (
                    <div key={index}>
                      <p className="text-sm text-gray-500">{info.label}</p>
                      <p className="font-medium text-gray-800">{info.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Security section */}
      <Card title="Security Settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Change Password</h4>
              <p className="text-sm text-gray-500">Update your password regularly for security</p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Active Sessions</h4>
              <p className="text-sm text-gray-500">Manage your active login sessions</p>
            </div>
            <Button variant="outline">View Sessions</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
