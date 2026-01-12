'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/lib/api/appointment';

interface AppointmentDetailDialogProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
}

const AppointmentDetailDialog: React.FC<AppointmentDetailDialogProps> = ({ isOpen, appointment, onClose }) => {
  if (!isOpen || !appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>Reference: {appointment.appointmentId}</CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Citizen Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Citizen Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-base font-semibold text-gray-900">{appointment.citizenName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-base text-gray-900">{appointment.citizenPhone}</p>
              </div>
              {appointment.citizenWhatsApp && (
                <div>
                  <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                  <p className="text-base text-gray-900">{appointment.citizenWhatsApp}</p>
                </div>
              )}
              {appointment.citizenEmail && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base text-gray-900">{appointment.citizenEmail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Appointment Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Purpose</p>
                <p className="text-base text-gray-900">{appointment.purpose}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-base text-gray-900">
                    {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p className="text-base text-gray-900">{appointment.appointmentTime}</p>
                </div>
                {appointment.duration && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-base text-gray-900">{appointment.duration} minutes</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          {appointment.location && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Location</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-base text-gray-900">{appointment.location}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-base text-gray-900 whitespace-pre-wrap">{appointment.notes}</p>
              </div>
            </div>
          )}

          {/* Cancellation Details */}
          {(appointment as any).cancellationReason && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Cancellation Details</h3>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">Reason</p>
                <p className="text-base text-gray-900">{(appointment as any).cancellationReason}</p>
                {(appointment as any).cancelledAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Cancelled on: {new Date((appointment as any).cancelledAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Timeline</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(appointment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {(appointment as any).completedAt && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Completed</p>
                    <p className="text-xs text-gray-500">
                      {new Date((appointment as any).completedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentDetailDialog;
