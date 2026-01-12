'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { departmentAPI, Department } from '@/lib/api/department';
import { companyAPI, Company } from '@/lib/api/company';
import toast from 'react-hot-toast';

interface CreateDepartmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDepartmentCreated: () => void;
  editingDepartment?: Department | null;
}

const CreateDepartmentDialog: React.FC<CreateDepartmentDialogProps> = ({ isOpen, onClose, onDepartmentCreated, editingDepartment }) => {
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
        setFormData({
          name: '',
          description: '',
          contactPerson: '',
          contactEmail: '',
          contactPhone: '',
          companyId: ''
        });
      }
    }
  }, [isOpen, editingDepartment]);

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

    setLoading(true);
    try {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{editingDepartment ? 'Edit Department' : 'Create New Department'}</CardTitle>
          <CardDescription>{editingDepartment ? 'Update department information' : 'Add a new department to the platform'}</CardDescription>
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

            <div>
              <Label htmlFor="companyId">Company *</Label>
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
            </div>

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
                  onChange={handleChange}
                  placeholder="+1234567890"
                />
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (editingDepartment ? 'Updating...' : 'Creating...') : (editingDepartment ? 'Update Department' : 'Create Department')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateDepartmentDialog;
