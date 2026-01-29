'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EditFlowPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const companyId = params.id as string;
  const flowId = params.flowId as string;
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/superadmin/dashboard');
      return;
    }
    
    // Load flow and redirect to create page with flow data
    loadFlowAndRedirect();
  }, [user, companyId, flowId, router]);

  const loadFlowAndRedirect = async () => {
    try {
      const flowRes = await apiClient.get(`/chatbot-flows/${flowId}`);
      if (flowRes.success && flowRes.data) {
        // Store flow data in sessionStorage to avoid URL size limits
        const flowData = flowRes.data;
        const storageKey = `flow_edit_${flowId}`;
        sessionStorage.setItem(storageKey, JSON.stringify(flowData));
        
        // Redirect to create page with only flowId in query params
        router.push(`/superadmin/company/${companyId}/chatbot-flows/create?edit=${flowId}`);
      } else {
        toast.error('Flow not found');
        router.push(`/superadmin/company/${companyId}/chatbot-flows`);
      }
    } catch (error: any) {
      console.error('Failed to load flow:', error);
      toast.error('Failed to load flow for editing');
      router.push(`/superadmin/company/${companyId}/chatbot-flows`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Loading flow editor...</p>
      </div>
    </div>
  );
}
