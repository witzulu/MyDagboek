import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import UserManagementTable from './UserManagementTable';
import UniversalLabelManagement from './UniversalLabelManagement';
import { useSettings } from '../../context/SettingsContext';

const AdminDashboard = () => {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('siteSettings');
  const [localSettings, setLocalSettings] = useState(settings);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingsChange = (e) => {
    setLocalSettings({ ...localSettings, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      let settingsToUpdate = { ...localSettings };

      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        const updatedSettingsWithLogo = await api('/settings/upload-logo', {
          method: 'POST',
          body: formData,
        });
        settingsToUpdate.siteLogo = updatedSettingsWithLogo.siteLogo;
      }

      const finalUpdatedSettings = await api('/settings', {
        method: 'PUT',
        body: settingsToUpdate,
      });

      updateSettings(finalUpdatedSettings);
      setLogoFile(null);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Failed to update settings', error);
      alert('Failed to update settings');
    }
  };

  const handleResetLogo = async () => {
    try {
      const updatedSettings = await api('/settings/reset-logo', {
        method: 'DELETE',
      });
      updateSettings(updatedSettings);
      alert('Logo reset successfully!');
    } catch (error) {
      console.error('Failed to reset logo', error);
      alert('Failed to reset logo');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === 'siteSettings' ? 'border-b-2 border-indigo-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('siteSettings')}
        >
          Site Settings
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'userManagement' ? 'border-b-2 border-indigo-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('userManagement')}
        >
          User Management
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'labelManagement' ? 'border-b-2 border-indigo-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('labelManagement')}
        >
          Universal Labels
        </button>
      </div>

      {activeTab === 'siteSettings' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Site Settings</h2>
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium">Site Name</label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={localSettings.siteName || ''}
                onChange={handleSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="siteLogo" className="block text-sm font-medium">Site Logo</label>
              {settings.siteLogo && (
                <div className="mt-2">
                  <img src={`http://localhost:5000${settings.siteLogo}`} alt="Site Logo" className="h-16 w-16 object-cover" />
                </div>
              )}
              <input
                type="file"
                id="siteLogo"
                name="siteLogo"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={handleResetLogo}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Reset Logo
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'userManagement' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <UserManagementTable />
        </div>
      )}

      {activeTab === 'labelManagement' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Universal Label Management</h2>
          <UniversalLabelManagement />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
