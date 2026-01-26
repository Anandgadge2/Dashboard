'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { departmentAPI, Department } from '@/lib/api/department';
import { companyAPI, Company } from '@/lib/api/company';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { validatePhoneNumber, normalizePhoneNumber } from '@/lib/utils/phoneUtils';

interface CreateDepartmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDepartmentCreated: () => void;
  editingDepartment?: Department | null;
}

const CreateDepartmentDialog: React.FC<CreateDepartmentDialogProps> = ({ isOpen, onClose, onDepartmentCreated, editingDepartment }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    companyId: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      if (editingDepartment) {
        setFormData({
          name: editingDepartment.name || '',
          description: editingDepartment.description || '',
          contactPerson: editingDepartment.contactPerson || '',
          contactEmail: editingDepartment.contactEmail || '',
          contactPhone: editingDepartment.contactPhone || '',
          companyId: typeof editingDepartment.companyId === 'object' 
            ? editingDepartment.companyId._id 
            : editingDepartment.companyId || ''
        });
      } else {
        // Auto-select company for company admins when creating new department
        const userCompanyId = user?.companyId 
          ? (typeof user.companyId === 'object' ? user.companyId._id : user.companyId)
          : '';
        
        setFormData({
          name: '',
          description: '',
          contactPerson: '',
          contactEmail: '',
          contactPhone: '',
          companyId: userCompanyId
        });
      }
    }
  }, [isOpen, editingDepartment, user]);

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getAll();
      if (response.success) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.companyId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate phone number if provided
    if (formData.contactPhone && !validatePhoneNumber(formData.contactPhone)) {
      toast.error('Contact phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    try {
      // Send phone number as-is (10 digits) - backend will normalize it
      let response;
      if (editingDepartment) {
        response = await departmentAPI.update(editingDepartment._id, formData);
        if (response.success) {
          toast.success('Department updated successfully!');
        } else {
          toast.error('Failed to update department');
        }
      } else {
        response = await departmentAPI.create(formData);
        if (response.success) {
          toast.success('Department created successfully!');
        } else {
          toast.error('Failed to create department');
        }
      }
      
      if (response.success) {
        setFormData({
          name: '',
          description: '',
          contactPerson: '',
          contactEmail: '',
          contactPhone: '',
          companyId: ''
        });
        onClose();
        onDepartmentCreated();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 
        (editingDepartment ? 'Failed to update department' : 'Failed to create department');
      console.error('Department error:', error.response?.data);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-lg rounded-2xl border border-slate-200/50 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl text-white">{editingDepartment ? 'Edit Department' : 'Create New Department'}</CardTitle>
              <CardDescription className="text-purple-100">{editingDepartment ? 'Update department information' : 'Add a new department to the platform'}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter department name"
              />
            </div>

           {/* <div>
              <Label htmlFor="companyId">Company *</Label> 
              {user?.role === 'COMPANY_ADMIN' && !editingDepartment ? (
                <>
                  <Input
                    id="companyId"
                    type="text"
                    value={companies.find(c => c._id === formData.companyId)?.name || 'Loading...'}
                    disabled
                    className="bg-gray-50"
                  />
                  <input type="hidden" name="companyId" value={formData.companyId} />
                </>
              ) : (
                <select
                  id="companyId"
                  name="companyId"
                  value={formData.companyId}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              )}
            </div> */}

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded-md"
                placeholder="Department description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => {
                    // Only allow digits, max 10
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({ ...prev, contactPhone: value }));
                  }}
                  maxLength={10}
                  placeholder="10 digit number (e.g., 9356150561)"
                />
                {formData.contactPhone && !validatePhoneNumber(formData.contactPhone) && (
                  <p className="text-xs text-red-500 mt-1">Phone number must be exactly 10 digits</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="contact@department.com"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-6 border-slate-300 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="px-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-lg shadow-purple-500/25"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    {editingDepartment ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (editingDepartment ? 'Update Department' : 'Create Department')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateDepartmentDialog;
