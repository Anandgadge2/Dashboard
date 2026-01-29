'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, MessageSquare, List } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ViewFlowPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const companyId = params.id as string;
  const flowId = params.flowId as string;
  
  const [loading, setLoading] = useState(true);
  const [flow, setFlow] = useState<any>(null);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/superadmin/dashboard');
      return;
    }
    fetchFlow();
  }, [user, flowId]);

  const fetchFlow = async () => {
    try {
      const res = await apiClient.get(`/chatbot-flows/${flowId}`);
      // apiClient.get() returns response.data directly
      if (res.success && res.data) {
        setFlow(res.data);
      } else if (res.data) {
        // Fallback: sometimes data is directly in response
        setFlow(res.data);
      } else {
        toast.error('Flow not found');
        router.push(`/superadmin/company/${companyId}/chatbot-flows`);
      }
    } catch (error: any) {
      console.error('Failed to load flow:', error);
      toast.error('Failed to load flow');
      router.push(`/superadmin/company/${companyId}/chatbot-flows`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!flow) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push(`/superadmin/company/${companyId}/chatbot-flows`)} 
                className="text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Flows
              </Button>
              <h1 className="text-2xl font-bold text-white tracking-tight">{flow.flowName || flow.name || 'Unnamed Flow'}</h1>
              {flow.isActive && (
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push(`/superadmin/company/${companyId}/chatbot-flows/${flowId}/edit`)}
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Flow
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Flow Information</CardTitle>
              <CardDescription>{flow.flowDescription || flow.description || 'No description'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Version:</strong> {flow.version}
                </div>
                <div>
                  <strong>Trigger:</strong> {
                    flow.triggers && flow.triggers.length > 0
                      ? flow.triggers.map((t: any, idx: number) => (
                          <span key={idx}>
                            {t.triggerType}: "{t.triggerValue}"{idx < flow.triggers.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      : flow.trigger?.type ? `${flow.trigger.type} → ${flow.trigger.value}` : 'N/A'
                  }
                </div>
                <div>
                  <strong>Created:</strong> {new Date(flow.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>Updated:</strong> {new Date(flow.updatedAt).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Flow Steps ({flow.steps?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flow.steps?.map((step: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        {step.stepName || step.stepId}
                      </CardTitle>
                      <CardDescription>Type: {step.stepType || step.type}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <strong className="text-sm">Message:</strong>
                        <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {step.messageText || step.content?.text?.en || 'No message'}
                        </p>
                      </div>
                      
                      {step.content?.buttons && step.content.buttons.length > 0 && (
                        <div>
                          <strong className="text-sm">Buttons:</strong>
                          <div className="mt-2 space-y-2">
                            {step.content.buttons.map((btn: any, btnIdx: number) => (
                              <div key={btnIdx} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                <span className="text-xs font-mono bg-blue-100 px-2 py-1 rounded">
                                  {btn.id}
                                </span>
                                <span className="text-sm">{btn.title || btn.text?.en || btn.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {step.nextStepId && (
                        <div className="text-sm text-gray-500">
                          → Next: <strong>{step.nextStepId}</strong>
                        </div>
                      )}
                      {!step.nextStepId && step.nextStep && (
                        <div className="text-sm text-gray-500">
                          → Next: <strong>{step.nextStep}</strong>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
