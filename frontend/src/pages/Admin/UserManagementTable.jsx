import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const UserManagementTable = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api('/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api(`/users/${userId}/approve`, { method: 'PUT' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to approve user', error);
    }
  };

  const handleBlock = async (userId) => {
    try {
      await api(`/users/${userId}/block`, { method: 'PUT' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to block user', error);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await api(`/users/${userId}/unblock`, { method: 'PUT' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to unblock user', error);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const updatedUsers = await api(`/users/${userId}/role`, {
        method: 'PUT',
        body: { role },
      });
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Failed to update role', error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{user.status}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="user">User</option>
                  <option value="system_admin">System Admin</option>
                </select>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                {user.status === 'pending' && (
                  <button onClick={() => handleApprove(user._id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Approve</button>
                )}
                {user.status === 'approved' && (
                  <button onClick={() => handleBlock(user._id)} className="text-red-600 hover:text-red-900">Block</button>
                )}
                {user.status === 'blocked' && (
                  <button onClick={() => handleUnblock(user._id)} className="text-green-600 hover:text-green-900">Unblock</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementTable;
