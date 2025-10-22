import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ siteName: 'Dagboek', siteLogo: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api('/settings');
        setSettings(data);
      } catch (error) {
        // Suppress error for non-admins
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    document.title = settings.siteName;
    const favicon = document.querySelector("link[rel~='icon']");
    if (favicon) {
      favicon.href = settings.siteLogo;
    }
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
