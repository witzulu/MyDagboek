import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import UserManagementTable from './UserManagementTable';

const AdminDashboard = () => {
  const [settings, setSettings] = useState({ siteName: '', siteLogo: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api('/settings');
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSettingsChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedSettings = await api('/settings', {
        method: 'PUT',
        body: settings,
      });
      setSettings(updatedSettings);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Failed to update settings', error);
      alert('Failed to update settings');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Site Settings</h2>
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium">Site Name</label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={settings.siteName || ''}
                onChange={handleSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="siteLogo" className="block text-sm font-medium">Site Logo URL</label>
              <input
                type="text"
                id="siteLogo"
                name="siteLogo"
                value={settings.siteLogo || ''}
                onChange={handleSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Settings
            </button>
          </form>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <UserManagementTable />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
