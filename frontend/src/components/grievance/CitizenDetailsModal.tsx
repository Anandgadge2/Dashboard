'use client';

import React from 'react';
import { Grievance } from '@/lib/api/grievance';
import { Appointment } from '@/lib/api/appointment';
import { X, MapPin, Phone, Calendar, Image as ImageIcon, FileText, User, MessageCircle, Tag, Clock, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { format, formatDistanceToNow } from 'date-fns';

// Helper function to detect document type
const getDocumentType = (url: string): { isDocument: boolean; type: string; icon: string; color: string } => {
  const ext = url.split('.').pop()?.toLowerCase();
  
  // PDF
  if (ext === 'pdf' || url.toLowerCase().includes('pdf')) {
    return { isDocument: true, type: 'PDF Document', icon: 'file-text', color: 'red' };
  }
  
  // Word
  if (['doc', 'docx'].includes(ext || '') || url.match(/\.(doc|docx)$/i)) {
    return { isDocument: true, type: 'Word Document', icon: 'file-text', color: 'blue' };
  }
  
  // Excel
  if (['xls', 'xlsx', 'csv'].includes(ext || '') || url.match(/\.(xls|xlsx|csv)$/i)) {
    return { isDocument: true, type: 'Excel Sheet', icon: 'file-spreadsheet', color: 'green' };
  }
  
  // PowerPoint
  if (['ppt', 'pptx'].includes(ext || '') || url.match(/\.(ppt|pptx)$/i)) {
    return { isDocument: true, type: 'PowerPoint', icon: 'presentation', color: 'orange' };
  }
  
  // Archive
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '') || url.match(/\.(zip|rar|7z|tar|gz)$/i)) {
    return { isDocument: true, type: 'Archive File', icon: 'file-archive', color: 'purple' };
  }
  
  // Text
  if (ext === 'txt' || url.match(/\.txt$/i)) {
    return { isDocument: true, type: 'Text File', icon: 'file-text', color: 'gray' };
  }
  
  // Default for documents (if we reached here it's likely a document based on how it's stored)
  if (url.includes('/raw/upload/') || !url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
     return { isDocument: true, type: 'Document', icon: 'file', color: 'slate' };
  }

  return { isDocument: false, type: 'Image', icon: 'image', color: '' };
};

// Helper function to fix Cloudinary URLs for PDFs and documents
const fixCloudinaryUrl = (url: string): string => {
  if (!url) return url;
  
  // Only process actual Cloudinary URLs (not WhatsApp media IDs)
  if (!url.startsWith('http') || !url.includes('cloudinary.com')) {
    return url; // Return as-is if not a Cloudinary URL
  }
  
  // We no longer add fl_attachment as we want to view documents in the browser tab
  return url;
};

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
  const createdDate = new Date(data?.createdAt || '');
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
  const id = grievance?.grievanceId || appointment?.appointmentId;

  // Get status config for header gradient
  const getStatusConfig = () => {
    const status = data?.status || 'PENDING';
    switch (status) {
      case 'RESOLVED':
      case 'COMPLETED':
        return { gradient: 'from-emerald-500 to-green-600', icon: <FileText className="w-6 h-6 text-white" /> };
      case 'CONFIRMED':
      case 'IN_PROGRESS':
        return { gradient: 'from-blue-500 to-indigo-600', icon: <FileText className="w-6 h-6 text-white" /> };
      case 'SCHEDULED':
        return { gradient: 'from-indigo-500 to-purple-600', icon: <FileText className="w-6 h-6 text-white" /> };
      case 'CANCELLED':
        return { gradient: 'from-red-500 to-rose-600', icon: <FileText className="w-6 h-6 text-white" /> };
      default:
        return { gradient: 'from-amber-500 to-orange-600', icon: <FileText className="w-6 h-6 text-white" /> };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto md:p-4">
      <div className="w-full md:max-w-4xl h-[100dvh] md:h-auto md:max-h-[90vh] overflow-hidden rounded-t-3xl md:rounded-2xl shadow-2xl bg-white animate-in slide-in-from-bottom md:zoom-in duration-300 flex flex-col">
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${statusConfig.gradient} p-4 md:p-5 relative overflow-hidden flex-shrink-0`}>
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50"></div>
          
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                  {React.cloneElement(statusConfig.icon as React.ReactElement, { className: 'w-5 h-5 md:w-6 md:h-6' })}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base md:text-lg font-bold text-white leading-tight">Citizen Details</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-[11px] font-bold text-white backdrop-blur-sm">
                      {type} ID: {id}
                    </span>
                    <span className="text-white/80 text-xs">•</span>
                    <span className="text-white/80 text-xs">{timeAgo}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all backdrop-blur-sm flex-shrink-0"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 md:p-5 space-y-4 md:space-y-5">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase">Citizen</span>
              </div>
              <p className="text-base font-bold text-gray-900 break-words">{data?.citizenName}</p>
            </div>

            {grievance && (
              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-4 border border-purple-100 group relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-xs font-bold text-purple-600 uppercase">Category</span>
                </div>
                <p className="text-base font-bold text-gray-900 break-words">
                  {grievance.category || 'General'}
                </p>
              </div>
            )}

            {appointment && (
              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-4 border border-purple-100 group relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-xs font-bold text-purple-600 uppercase">Date</span>
                </div>
                <p className="text-base font-bold text-gray-900">
                  {format(new Date(appointment.appointmentDate), 'dd MMM yyyy')}
                </p>
              </div>
            )}

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xs font-bold text-emerald-600 uppercase">Created</span>
              </div>
              <p className="text-base font-bold text-gray-900">{format(createdDate, 'dd MMM yyyy')}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-xs font-bold text-amber-600 uppercase">Time</span>
              </div>
              <p className="text-base font-bold text-gray-900">{format(createdDate, 'hh:mm a')}</p>
            </div>
          </div>

          {/* Citizen Information */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-4 md:px-6 py-3 md:py-5 border-b border-slate-100">
              <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                Citizen Information
              </h3>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name</p>
                    <p className="text-base font-bold text-slate-800 break-words">{data?.citizenName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Phone Number</p>
                    <p className="text-base font-bold text-slate-800">{data?.citizenPhone}</p>
                  </div>
                </div>

                {data?.citizenWhatsApp && (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">WhatsApp</p>
                      <p className="text-base font-bold text-slate-800">{data?.citizenWhatsApp}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grievance/Appointment Details */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-slate-50 to-purple-50 px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                {type} Details
              </h3>
            </div>
            <div className="p-6 space-y-5">
              {grievance && (
                <>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Category</p>
                    <span className="inline-block px-4 py-2 rounded-lg text-base font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {grievance.category || 'General'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Description</p>
                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-slate-100">
                      <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {grievance.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                </>
              )}
              
              {appointment && (
                <>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Purpose</p>
                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-slate-100">
                      <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {appointment.purpose || 'No purpose provided'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Date</p>
                      <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        {format(new Date(appointment.appointmentDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Time</p>
                      <p className="text-base font-bold text-slate-800">{appointment.appointmentTime}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-5 pt-2">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Created At</p>
                  <p className="text-base font-semibold text-slate-800">{format(createdDate, 'dd/MM/yyyy, hh:mm:ss a')}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Last Updated</p>
                  <p className="text-base font-semibold text-slate-800">
                    {format(new Date(data?.updatedAt || data?.createdAt || ''), 'dd/MM/yyyy, hh:mm:ss a')}
                  </p>
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
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-slate-50 to-pink-50 px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-pink-600" />
                  Attached Files
                  <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">
                    {grievance.media.length}
                  </span>
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {grievance.media.map((media: any, index: number) => {
                    const fixedUrl = fixCloudinaryUrl(media.url);
                    const docInfo = getDocumentType(media.url);
                    
                    // Color mapping for different document types
                    const colorMap: Record<string, { from: string; to: string; text: string; hover: string }> = {
                      red: { from: 'from-red-50', to: 'to-orange-50', text: 'text-red-700', hover: 'hover:from-red-100 hover:to-orange-100' },
                      blue: { from: 'from-blue-50', to: 'to-indigo-50', text: 'text-blue-700', hover: 'hover:from-blue-100 hover:to-indigo-100' },
                      green: { from: 'from-green-50', to: 'to-emerald-50', text: 'text-green-700', hover: 'hover:from-green-100 hover:to-emerald-100' },
                      orange: { from: 'from-orange-50', to: 'to-amber-50', text: 'text-orange-700', hover: 'hover:from-orange-100 hover:to-amber-100' },
                      purple: { from: 'from-purple-50', to: 'to-fuchsia-50', text: 'text-purple-700', hover: 'hover:from-purple-100 hover:to-fuchsia-100' },
                      gray: { from: 'from-gray-50', to: 'to-slate-50', text: 'text-gray-700', hover: 'hover:from-gray-100 hover:to-slate-100' },
                      slate: { from: 'from-slate-100', to: 'to-slate-200', text: 'text-slate-700', hover: 'hover:from-slate-200 hover:to-slate-300' },
                    };
                    
                    const colors = colorMap[docInfo.color] || colorMap.slate;
                    
                    return (
                      <div 
                        key={index} 
                        className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video cursor-pointer"
                        onClick={() => !docInfo.isDocument && window.open(fixedUrl, '_blank')}
                      >
                        {docInfo.isDocument ? (
                          // Document Preview (PDF, Word, Excel, PowerPoint, etc.)
                          <a
                            href={fixedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex flex-col items-center justify-center w-full h-full bg-gradient-to-br ${colors.from} ${colors.to} ${colors.hover} transition-all`}
                          >
                            <FileText className={`w-12 h-12 ${colors.text} mb-2`} />
                            <span className={`text-xs font-bold ${colors.text}`}>{docInfo.type}</span>
                            <span className={`text-[10px] ${colors.text} opacity-70 mt-1 uppercase tracking-wider font-semibold`}>View Document</span>
                          </a>
                        ) : (
                          // Image Preview
                          <>
                            <Image
                              src={fixedUrl}
                              alt={`Evidence ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-md p-2 rounded-full">
                                <ExternalLink className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Status History */}
          {grievance?.statusHistory && grievance.statusHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50 px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Status History
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {grievance.statusHistory.map((history: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        history.status === 'RESOLVED' ? 'bg-green-500' :
                        history.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">{history.status}</p>
                        <p className="text-xs text-slate-600 mt-1">{history.remarks || 'Status updated'}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {format(new Date(history.changedAt), 'dd/MM/yyyy, hh:mm:ss a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Department & Assignment */}
          {(data?.departmentId || data?.assignedTo) && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-slate-50 to-slate-50 px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-slate-600" />
                  Assignment Information
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data?.departmentId && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Department</p>
                      <p className="text-sm font-bold text-slate-800">
                        {typeof data.departmentId === 'object' ? (data.departmentId as any).name : data.departmentId}
                      </p>
                    </div>
                  )}
                  {data?.assignedTo && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Assigned To</p>
                      <p className="text-sm font-bold text-slate-800">
                        {typeof data.assignedTo === 'object' 
                          ? `${(data.assignedTo as any).firstName} ${(data.assignedTo as any).lastName}`
                          : data.assignedTo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 flex justify-end bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      

    </div>
  );
}
