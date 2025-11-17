"use client";

import { useState } from 'react';
import { BusinessRule } from '@/types/admin';

export default function SettingsPage() {
  // Mock settings data
  const [settings, setSettings] = useState<BusinessRule[]>([
    {
      id: 'setting1',
      category: 'staking',
      name: 'Minimum Stake Amount',
      description: 'The minimum amount required to create a stake',
      value: '500',
      type: 'number',
      isActive: true,
      canModify: true,
      lastModified: '2023-04-01T10:00:00Z',
      modifiedBy: 'Admin User',
    },
    {
      id: 'setting2',
      category: 'staking',
      name: 'Maximum Stake Amount',
      description: 'The maximum amount that can be staked in a single stake',
      value: '100000',
      type: 'number',
      isActive: true,
      canModify: true,
      lastModified: '2023-04-01T10:00:00Z',
      modifiedBy: 'Admin User',
    },
    {
      id: 'setting3',
      category: 'withdrawal',
      name: 'Minimum Withdrawal',
      description: 'The minimum amount that can be withdrawn',
      value: '100',
      type: 'number',
      isActive: true,
      canModify: true,
      lastModified: '2023-04-02T14:30:00Z',
      modifiedBy: 'Admin User',
    },
    {
      id: 'setting4',
      category: 'withdrawal',
      name: 'Withdrawal Fee',
      description: 'Fee charged on withdrawals as a percentage',
      value: '2.5',
      type: 'percentage',
      isActive: true,
      canModify: true,
      lastModified: '2023-04-02T14:30:00Z',
      modifiedBy: 'Admin User',
    },
    {
      id: 'setting5',
      category: 'referral',
      name: 'Referral Bonus',
      description: 'Percentage bonus for referring new users',
      value: '5',
      type: 'percentage',
      isActive: true,
      canModify: true,
      lastModified: '2023-04-03T09:15:00Z',
      modifiedBy: 'Admin User',
    },
    {
      id: 'setting6',
      category: 'security',
      name: 'Require 2FA for Withdrawal',
      description: 'Whether 2FA is required for withdrawals',
      value: 'true',
      type: 'boolean',
      isActive: true,
      canModify: true,
      lastModified: '2023-04-04T11:20:00Z',
      modifiedBy: 'Admin User',
    },
    {
      id: 'setting7',
      category: 'security',
      name: 'KYC Required for Withdrawals',
      description: 'Whether KYC verification is required for withdrawals',
      value: 'true',
      type: 'boolean',
      isActive: true,
      canModify: true,
      lastModified: '2023-04-04T11:20:00Z',
      modifiedBy: 'Admin User',
    },
    {
      id: 'setting8',
      category: 'bonus',
      name: 'Welcome Bonus',
      description: 'Bonus amount for new users',
      value: '50',
      type: 'number',
      isActive: false,
      canModify: true,
      lastModified: '2023-04-05T15:45:00Z',
      modifiedBy: 'Admin User',
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // General platform settings
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [registrationsEnabled, setRegistrationsEnabled] = useState<boolean>(true);
  const [stakingEnabled, setStakingEnabled] = useState<boolean>(true);
  const [withdrawalsEnabled, setWithdrawalsEnabled] = useState<boolean>(true);

  // Filter settings by category
  const filteredSettings = settings.filter(setting => 
    (selectedCategory === 'all' || setting.category === selectedCategory) &&
    (showInactive || setting.isActive)
  );

  // Categories with counts
  const categories = [
    { id: 'all', name: 'All Settings', count: settings.filter(s => showInactive || s.isActive).length },
    { id: 'staking', name: 'Staking', count: settings.filter(s => s.category === 'staking' && (showInactive || s.isActive)).length },
    { id: 'withdrawal', name: 'Withdrawals', count: settings.filter(s => s.category === 'withdrawal' && (showInactive || s.isActive)).length },
    { id: 'referral', name: 'Referrals', count: settings.filter(s => s.category === 'referral' && (showInactive || s.isActive)).length },
    { id: 'security', name: 'Security', count: settings.filter(s => s.category === 'security' && (showInactive || s.isActive)).length },
    { id: 'bonus', name: 'Bonuses', count: settings.filter(s => s.category === 'bonus' && (showInactive || s.isActive)).length },
  ];

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Handle edit start
  const handleEdit = (setting: BusinessRule) => {
    setEditingId(setting.id);
    setEditValue(setting.value.toString());
  };

  // Handle save
  const handleSave = (id: string) => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSettings(prev => 
        prev.map(setting => 
          setting.id === id ? { ...setting, value: editValue, lastModified: new Date().toISOString(), modifiedBy: 'Current Admin' } : setting
        )
      );
      setEditingId(null);
      setIsSaving(false);
    }, 500);
  };

  // Handle toggle active state
  const handleToggleActive = (id: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, isActive: !setting.isActive, lastModified: new Date().toISOString(), modifiedBy: 'Current Admin' } : setting
      )
    );
  };

  // Handle platform settings update
  const handleUpdatePlatformSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      // In a real app, you would update the settings in the backend
      console.log({
        maintenanceMode,
        registrationsEnabled,
        stakingEnabled,
        withdrawalsEnabled
      });
    }, 500);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Platform Settings
        </h2>
      </div>

      {/* Platform Status Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
          Platform Status
        </h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="maintenance-mode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Maintenance Mode
              </label>
              <button
                type="button"
                className={`${
                  maintenanceMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                onClick={() => setMaintenanceMode(!maintenanceMode)}
              >
                <span
                  className={`${
                    maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              When enabled, the site will display a maintenance message to users.
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="registrations" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                User Registrations
              </label>
              <button
                type="button"
                className={`${
                  registrationsEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                onClick={() => setRegistrationsEnabled(!registrationsEnabled)}
              >
                <span
                  className={`${
                    registrationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              When disabled, new users cannot register on the platform.
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="staking" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Staking
              </label>
              <button
                type="button"
                className={`${
                  stakingEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                onClick={() => setStakingEnabled(!stakingEnabled)}
              >
                <span
                  className={`${
                    stakingEnabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              When disabled, users cannot create new stakes.
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="withdrawals" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Withdrawals
              </label>
              <button
                type="button"
                className={`${
                  withdrawalsEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                onClick={() => setWithdrawalsEnabled(!withdrawalsEnabled)}
              >
                <span
                  className={`${
                    withdrawalsEnabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              When disabled, users cannot initiate withdrawals.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleUpdatePlatformSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Platform Settings'}
          </button>
        </div>
      </div>

      {/* Settings Section */}
      <div>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <select
                id="category"
                name="category"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="show-inactive"
                name="show-inactive"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                checked={showInactive}
                onChange={() => setShowInactive(!showInactive)}
              />
              <label htmlFor="show-inactive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Show inactive settings
              </label>
            </div>
          </div>

          <div className="mt-3 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Setting
            </button>
          </div>
        </div>

        {/* Settings Table */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Setting
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSettings.map((setting) => (
                  <tr key={setting.id} className={!setting.isActive ? 'bg-gray-50 dark:bg-gray-800/40' : 'bg-white dark:bg-gray-800'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{setting.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 capitalize">
                        {setting.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === setting.id ? (
                        <div className="flex items-center space-x-2">
                          {setting.type === 'boolean' ? (
                            <select
                              className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                            >
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          ) : (
                            <input
                              type={setting.type === 'number' || setting.type === 'percentage' ? 'number' : 'text'}
                              className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              min={0}
                              step={setting.type === 'percentage' ? '0.01' : '1'}
                            />
                          )}
                          
                          <button
                            className="p-1 rounded-md text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                            onClick={() => handleSave(setting.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          <button
                            className="p-1 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            onClick={() => setEditingId(null)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {setting.type === 'percentage' 
                            ? `${setting.value}%` 
                            : setting.type === 'boolean'
                              ? setting.value === 'true' ? 'Enabled' : 'Disabled'
                              : setting.value}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        setting.isActive 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {setting.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(setting.lastModified)}
                      <div className="text-xs">by {setting.modifiedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        {setting.canModify && (
                          <>
                            <button
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                              onClick={() => handleEdit(setting)}
                            >
                              Edit
                            </button>
                            <button
                              className={`${
                                setting.isActive 
                                  ? 'text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300' 
                                  : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300'
                              }`}
                              onClick={() => handleToggleActive(setting.id)}
                            >
                              {setting.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredSettings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      No settings found in this category
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}