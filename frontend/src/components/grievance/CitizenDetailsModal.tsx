'use client';

import { Grievance } from '@/lib/api/grievance';
import { Appointment } from '@/lib/api/appointment';
import { X, MapPin, Phone, Calendar, Image as ImageIcon, FileText } from 'lucide-react';
import Image from 'next/image';

interface CitizenDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  grievance?: Grievance | null;
  appointment?: Appointment | null;
}

export default function CitizenDetailsModal({
  isOpen,
  onClose,
  grievance,
  appointment
}: CitizenDetailsModalProps) {
  if (!isOpen || (!grievance && !appointment)) return null;

  const data = (grievance || appointment) as any;
  const type = grievance ? 'Grievance' : 'Appointment';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Citizen Details</h2>
            <p className="text-blue-100 text-sm mt-1">
              {type} ID: {grievance?.grievanceId || appointment?.appointmentId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Citizen Information */}
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
                {data?.citizenName?.charAt(0) || 'C'}
              </div>
              Citizen Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg font-semibold text-gray-900">{data?.citizenName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-lg font-semibold text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-green-600" />
                  {data?.citizenPhone}
                </p>
              </div>
              {data?.citizenWhatsApp && (
                <div>
                  <label className="text-sm font-medium text-gray-500">WhatsApp Number</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-green-600" />
                    {data?.citizenWhatsApp}
                  </p>
                </div>
              )}
              {/* {data?.citizenEmail && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg font-semibold text-gray-900">{data?.citizenEmail}</p>
                </div>
              )} */}
            </div>
          </div>

          {/* Grievance/Appointment Details */}
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              {type} Details
            </h3>
            <div className="space-y-4">
              {grievance && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <span className="ml-3 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {grievance.category || 'General'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 mt-1 p-4 bg-white rounded border">{grievance.description}</p>
                  </div>
                  {grievance.priority && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Priority</label>
                      <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
                        grievance.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        grievance.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {grievance.priority}
                      </span>
                    </div>
                  )}
                </>
              )}
              
              {appointment && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Purpose</label>
                    <p className="text-gray-900 mt-1 p-4 bg-white rounded border">{appointment.purpose}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date</label>
                      <p className="text-lg font-semibold text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Time</label>
                      <p className="text-lg font-semibold text-gray-900">{appointment.appointmentTime}</p>
                    </div>
                  </div>
                </>
              )}

              {/* <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
                  data?.status === 'RESOLVED' || data?.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  data?.status === 'IN_PROGRESS' || data?.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  data?.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {data?.status}
                </span>
              </div> */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-gray-900">{new Date(data?.createdAt || '').toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900">{new Date(data?.updatedAt || '').toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          {/* {(grievance?.location || appointment?.location) && (
            <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Location Details
              </h3>
              <div className="space-y-3">
                {grievance?.location && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Latitude</label>
                        <p className="text-gray-900 font-mono">{grievance.location.coordinates?.[1] || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Longitude</label>
                        <p className="text-gray-900 font-mono">{grievance.location.coordinates?.[0] || 'N/A'}</p>
                      </div>
                    </div>
                    {grievance.location.coordinates && (
                      <div className="mt-4">
                        <a
                          href={`https://www.google.com/maps?q=${grievance.location.coordinates[1]},${grievance.location.coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          View on Google Maps
                        </a>
                      </div>
                    )}
                  </>
                )}
                {grievance?.location?.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900 mt-1">{grievance.location.address}</p>
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* Media/Photos */}
          {grievance?.media && grievance.media.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
                Attached Photos ({grievance.media.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {grievance.media.map((media: any, index: number) => (
                  <div key={index} className="relative group">
                    <Image
                      src={media.url}
                      alt={`Evidence ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => window.open(media.url, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-semibold">
                        Click to enlarge
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {new Date(media.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status History */}
          {grievance?.statusHistory && grievance.statusHistory.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
              <div className="space-y-3">
                {grievance.statusHistory.map((history: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4 p-3 bg-white rounded-lg border border-gray-200">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      history.status === 'RESOLVED' ? 'bg-green-500' :
                      history.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{history.status}</p>
                      <p className="text-sm text-gray-600">{history.remarks || 'Status updated'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(history.changedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Department & Assignment */}
          {(data?.departmentId || data?.assignedTo) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.departmentId && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {typeof data.departmentId === 'object' ? (data.departmentId as any).name : data.departmentId}
                  </p>
                </div>
              )}
              {data?.assignedTo && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <label className="text-sm font-medium text-gray-500">Assigned To</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {typeof data.assignedTo === 'object' 
                      ? `${(data.assignedTo as any).firstName} ${(data.assignedTo as any).lastName}`
                      : data.assignedTo}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

const Button = ({ onClick, className, children }: any) => (
  <button onClick={onClick} className={className}>
    {children}
  </button>
);
