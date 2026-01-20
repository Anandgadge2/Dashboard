'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { userAPI, User } from '@/lib/api/user';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserRole } from '@/lib/permissions';
import { Shield } from 'lucide-react';

interface ChangePermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsUpdated: () => void;
  user: User | null;
}

const ChangePermissionsDialog: React.FC<ChangePermissionsDialogProps> = ({ 
  isOpen, 
  onClose, 
  onPermissionsUpdated, 
  user 
}) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    if (isOpen && user) {
      setSelectedRole(user.role || 'OPERATOR');
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedRole === user.role) {
      toast.error('User already has this role');
      return;
    }

    setLoading(true);
    try {
      await userAPI.update(user._id, { role: selectedRole });
      toast.success('User permissions updated successfully');
      onPermissionsUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRoles = () => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      return [
        { value: 'SUPER_ADMIN', label: 'Super Admin' },
        { value: 'COMPANY_ADMIN', label: 'Company Admin' },
        { value: 'DEPARTMENT_ADMIN', label: 'Department Admin' },
        { value: 'OPERATOR', label: 'Operator' },
        { value: 'ANALYTICS_VIEWER', label: 'Analytics Viewer' }
      ];
    } else if (currentUser?.role === 'COMPANY_ADMIN') {
      return [
        { value: 'DEPARTMENT_ADMIN', label: 'Department Admin' },
        { value: 'OPERATOR', label: 'Operator' },
        { value: 'ANALYTICS_VIEWER', label: 'Analytics Viewer' }
      ];
    } else if (currentUser?.role === 'DEPARTMENT_ADMIN') {
      return [
        { value: 'OPERATOR', label: 'Operator' }
      ];
    }
    return [];
  };

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      'SUPER_ADMIN': 'Full system access with all permissions',
      'COMPANY_ADMIN': 'Manage company, departments, users, grievances, and appointments',
      'DEPARTMENT_ADMIN': 'Manage department, users, and assigned grievances/appointments',
      'OPERATOR': 'Can only update status and add comments to assigned items',
      'ANALYTICS_VIEWER': 'View-only access to analytics and reports'
    };
    return descriptions[role] || 'No description available';
  };

  if (!user) return null;

  const availableRoles = getAvailableRoles();
  const currentRoleInfo = availableRoles.find(r => r.value === user.role);
  const selectedRoleInfo = availableRoles.find(r => r.value === selectedRole);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Change User Permissions
          </DialogTitle>
          <DialogDescription>
            Change the role and permissions for {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Role</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-semibold text-gray-900">
                  {currentRoleInfo?.label || user.role}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {getRoleDescription(user.role)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">New Role *</Label>
              <select
                id="role"
                name="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                {availableRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {selectedRoleInfo && (
                <p className="text-sm text-gray-600 mt-1">
                  {getRoleDescription(selectedRole)}
                </p>
              )}
            </div>

            {selectedRole !== user.role && selectedRole && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Changing the role will update all permissions for this user. 
                  Make sure this is the correct role assignment.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || selectedRole === user.role}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Updating...' : 'Update Permissions'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePermissionsDialog;
