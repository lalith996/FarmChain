'use client';

import React, { useState, useEffect } from 'react';
import { rbacAdminAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Role {
  name: string;
  level: number;
  description: string;
  permissions: string[];
  requirements: {
    kycRequired: boolean;
    minimumVerificationLevel: number;
  };
}

interface RoleSelectorProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  multiSelect?: boolean;
  currentUserLevel?: number;
  label?: string;
  required?: boolean;
  className?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  multiSelect = false,
  currentUserLevel,
  label,
  required = false,
  className = '',
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await rbacAdminAPI.getRoleHierarchy();
      if (response.data.success) {
        setRoles(response.data.data.roles || []);
      }
    } catch (error) {
      console.error('Failed to fetch role hierarchy:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const isRoleDisabled = (roleLevel: number): boolean => {
    if (!currentUserLevel) return false;
    // User can only grant roles with level less than their own
    return roleLevel >= currentUserLevel;
  };

  const handleSingleSelect = (selectedRole: string) => {
    onChange(selectedRole);
  };

  const handleMultiSelect = (selectedRole: string) => {
    const currentValues = Array.isArray(value) ? value : [value];
    
    if (currentValues.includes(selectedRole)) {
      onChange(currentValues.filter(r => r !== selectedRole));
    } else {
      onChange([...currentValues, selectedRole]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {multiSelect ? (
        // Multi-select with checkboxes
        <div className="space-y-2 border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
          {roles.map((role) => {
            const isDisabled = disabled || isRoleDisabled(role.level);
            const isSelected = Array.isArray(value) && value.includes(role.name);

            return (
              <label
                key={role.name}
                className={`flex items-start p-2 rounded cursor-pointer ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed bg-gray-50'
                    : 'hover:bg-gray-50'
                } ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleMultiSelect(role.name)}
                  disabled={isDisabled}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {role.name}
                      <span className="ml-2 text-xs text-gray-500">
                        (Level {role.level})
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">
                      {role.permissions.length} permissions
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                  {role.requirements.kycRequired && (
                    <div className="mt-1">
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        KYC Required (Level {role.requirements.minimumVerificationLevel}+)
                      </span>
                    </div>
                  )}
                  {isDisabled && currentUserLevel && (
                    <p className="text-xs text-red-600 mt-1">
                      Cannot grant: Role level must be lower than yours
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      ) : (
        // Single select dropdown
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => handleSingleSelect(e.target.value)}
          disabled={disabled}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select a role</option>
          {roles.map((role) => (
            <option
              key={role.name}
              value={role.name}
              disabled={isRoleDisabled(role.level)}
            >
              {role.name} (Level {role.level}) - {role.permissions.length} permissions
              {role.requirements.kycRequired ? ' - KYC Required' : ''}
            </option>
          ))}
        </select>
      )}

      {/* Role details for selected role (single select only) */}
      {!multiSelect && typeof value === 'string' && value && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          {roles
            .filter(role => role.name === value)
            .map(role => (
              <div key={role.name}>
                <h4 className="font-semibold text-blue-900">{role.name}</h4>
                <p className="text-sm text-blue-700 mt-1">{role.description}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <span className="text-blue-600">
                    Level: {role.level}
                  </span>
                  <span className="text-blue-600">
                    Permissions: {role.permissions.length}
                  </span>
                  {role.requirements.kycRequired && (
                    <span className="text-blue-600">
                      KYC Required (Level {role.requirements.minimumVerificationLevel}+)
                    </span>
                  )}
                </div>
                
                {/* Show permissions in expandable section */}
                <details className="mt-2">
                  <summary className="text-sm text-blue-700 cursor-pointer hover:text-blue-900">
                    View all {role.permissions.length} permissions
                  </summary>
                  <div className="mt-2 max-h-40 overflow-y-auto bg-white p-2 rounded">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map(permission => (
                        <span
                          key={permission}
                          className="px-2 py-1 text-xs rounded bg-green-100 text-green-800"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            ))}
        </div>
      )}

      {/* Selected roles summary (multi-select only) */}
      {multiSelect && Array.isArray(value) && value.length > 0 && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-semibold text-green-900 mb-2">
            Selected Roles ({value.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {value.map(roleName => {
              const role = roles.find(r => r.name === roleName);
              return (
                <span
                  key={roleName}
                  className="px-3 py-1 text-sm font-medium rounded bg-green-100 text-green-800"
                >
                  {roleName}
                  {role && ` (${role.permissions.length} permissions)`}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelector;
