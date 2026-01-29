'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, Trash2, MoveUp, MoveDown, MessageSquare, Eye, Smartphone, FileText, Zap, ChevronDown } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FlowTemplates, FLOW_TEMPLATES, FlowTemplate } from '@/components/flow-builder/FlowTemplates';
import { WHATSAPP_LIMITS } from '@/config/whatsappLimits';

/** Save-to-field options for input steps: value is stored in session/DB and used in placeholders like {citizenName}. */
const SAVE_TO_FIELD_OPTIONS: { value: string; label: string; group?: string }[] = [
  { value: 'citizenName', label: 'Citizen Name', group: 'Grievance / Appointment' },
  { value: 'contactNumber', label: 'Contact / Phone Number', group: 'Grievance / Appointment' },
  { value: 'citizenPhone', label: 'Citizen Phone (alias)', group: 'Grievance / Appointment' },
  { value: 'description', label: 'Grievance Description', group: 'Grievance' },
  { value: 'category', label: 'Department / Category', group: 'Grievance' },
  { value: 'purpose', label: 'Appointment Purpose', group: 'Appointment' },
  { value: 'appointmentDate', label: 'Appointment Date', group: 'Appointment' },
  { value: 'appointmentTime', label: 'Appointment Time', group: 'Appointment' },
  { value: 'refNumber', label: 'Reference Number (track status)', group: 'Tracking' },
  { value: 'media', label: 'Media / Photo URL', group: 'Media' },
  { value: 'photoUrl', label: 'Photo URL (alias)', group: 'Media' },
  { value: 'location', label: 'Location (lat/long)', group: 'Other' },
  { value: 'custom', label: '— Other (enter below) —', group: 'Other' }
];

/** Save-to-field options for dynamic availability steps (date/time only). */
const AVAILABILITY_SAVE_TO_FIELD_OPTIONS: { value: string; label: string }[] = [
  { value: 'appointmentDate', label: 'Appointment Date' },
  { value: 'appointmentTime', label: 'Appointment Time' },
  { value: 'selectedDate', label: 'Selected Date' },
  { value: 'selectedTime', label: 'Selected Time' }
];

export default function CreateFlowPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const companyId = params.id as string;
  const editFlowId = searchParams.get('edit');
  
  const [loading, setLoading] = useState(!!editFlowId);
  const [saving, setSaving] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [flow, setFlow] = useState<any>({
    name: '',
    description: '',
    companyId,
    triggers: [
      {
        type: 'keyword',
        value: 'hi',
        startStepId: ''
      }
    ],
    steps: [],
    version: 1,
    isActive: false
  });

  // Load flow data if editing
  useEffect(() => {
    if (editFlowId && user?.role === 'SUPER_ADMIN') {
      loadFlowForEdit();
    }
  }, [editFlowId, user]);

  const loadFlowForEdit = async () => {
    try {
      setLoading(true);
      
      // First try to get from sessionStorage (set by edit page)
      const storageKey = `flow_edit_${editFlowId}`;
      const storedData = sessionStorage.getItem(storageKey);
      
      let flowData;
      if (storedData) {
        // Use data from sessionStorage
        flowData = JSON.parse(storedData);
        // Clear sessionStorage after use
        sessionStorage.removeItem(storageKey);
      } else {
        // Fallback: fetch from API
        const flowRes = await apiClient.get(`/chatbot-flows/${editFlowId}`);
        if (flowRes.success && flowRes.data) {
          flowData = flowRes.data;
        } else {
          toast.error('Flow not found');
          router.push(`/superadmin/company/${companyId}/chatbot-flows`);
          return;
        }
      }

      // Transform backend flow data to frontend format
      const transformedFlow = {
        name: flowData.flowName || flowData.name || '',
        description: flowData.flowDescription || flowData.description || '',
        companyId: flowData.companyId || companyId,
        triggers: flowData.triggers && flowData.triggers.length > 0 
          ? flowData.triggers.map((t: any) => ({
              type: t.triggerType || 'keyword',
              value: t.triggerValue || 'hi',
              startStepId: t.startStepId || ''
            }))
          : [
              {
                type: 'keyword',
                value: 'hi',
                startStepId: ''
              }
            ],
        steps: (flowData.steps || []).map((step: any) => {
          // Transform backend step to frontend format
          const frontendStep: any = {
            stepId: step.stepId || step.stepName || '',
            type: step.stepType || step.type || 'message',
            content: {
              text: step.messageText 
                ? { en: step.messageText }
                : (step.content?.text || { en: '' })
            },
            nextStep: step.nextStepId || step.nextStep || (step.inputConfig?.nextStepId) || null
          };

          // Transform buttons
          if (step.buttons && step.buttons.length > 0) {
            frontendStep.content.buttons = step.buttons.map((btn: any) => ({
              id: btn.buttonId || btn.id || '',
              text: btn.title 
                ? { en: btn.title }
                : (btn.text || { en: '' }),
              type: btn.buttonType || btn.type || 'reply',
              nextStep: btn.nextStepId || btn.nextStep || null
            }));
          }

          // Transform input config (include nextStepId so it loads when editing)
          if (step.inputConfig) {
            frontendStep.content.inputConfig = {
              inputType: step.inputConfig.inputType || 'text',
              saveToField: step.inputConfig.saveToField || '',
              required: step.inputConfig.required !== undefined ? step.inputConfig.required : true,
              minLength: step.inputConfig.minLength || 0,
              maxLength: step.inputConfig.maxLength || 1000,
              placeholder: step.inputConfig.placeholder || '',
              nextStepId: step.inputConfig.nextStepId || null
            };
          }

          // Transform availability config
          if (step.apiConfig && step.apiConfig.type === 'availability') {
            frontendStep.content.availabilityConfig = {
              availabilityType: step.apiConfig.availabilityType || 'appointment',
              dateRange: step.apiConfig.dateRange || 30,
              timeSlots: step.apiConfig.timeSlots || [],
              saveToField: step.apiConfig.saveToField || '',
              departmentId: step.apiConfig.departmentId || ''
            };
          }

          // Transform list config (for interactive_list)
          if (step.listConfig) {
            frontendStep.content.listSource = step.listConfig.listSource || 'manual';
            frontendStep.content.listButtonText = step.listConfig.buttonText || 'Select';
            frontendStep.content.listSectionTitle = step.listConfig.sections?.[0]?.title || 'Options';
          }

          // Transform action buttons (for collect_input)
          if (step.actionButtons && step.actionButtons.length > 0) {
            frontendStep.content.actionButtons = step.actionButtons.map((btn: any) => ({
              id: btn.buttonId || btn.id || '',
              text: btn.title 
                ? { en: btn.title }
                : (btn.text || { en: '' }),
              nextStep: btn.nextStepId || btn.nextStep || null
            }));
          }

          // Transform expected responses
          if (step.expectedResponses && step.expectedResponses.length > 0) {
            frontendStep.expectedResponses = step.expectedResponses.map((resp: any) => ({
              type: resp.type || 'text',
              value: resp.value || '',
              nextStepId: resp.nextStepId || null
            }));
          }

          return frontendStep;
        }),
        version: flowData.version || 1,
        isActive: flowData.isActive || false
      };

      setFlow(transformedFlow);
      toast.success('Flow loaded for editing');
    } catch (error: any) {
      console.error('Failed to load flow for editing:', error);
      toast.error('Failed to load flow for editing');
      router.push(`/superadmin/company/${companyId}/chatbot-flows`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!flow.name.trim()) {
        toast.error('Flow name is required');
        return;
      }

      if (flow.steps.length === 0) {
        toast.error('Add at least one step to the flow');
        return;
      }

      // Validate all steps have required fields
      const invalidSteps: string[] = [];
      flow.steps.forEach((step: any, index: number) => {
        if (!step.stepId || !step.stepId.trim()) {
          invalidSteps.push(`Step ${index + 1}: Missing Step ID`);
        }
        if (!step.type) {
          invalidSteps.push(`Step ${index + 1} (${step.stepId || 'unnamed'}): Missing Step Type`);
        }
        // For collect_input, validate saveToField
        if (step.type === 'collect_input' && step.content?.inputConfig) {
          if (!step.content.inputConfig.saveToField || !step.content.inputConfig.saveToField.trim()) {
            invalidSteps.push(`Step ${index + 1} (${step.stepId}): Collect Input requires "Save To Field"`);
          }
        }
        // For dynamic_availability, validate saveToField
        if (step.type === 'dynamic_availability' && step.content?.availabilityConfig) {
          if (!step.content.availabilityConfig.saveToField || !step.content.availabilityConfig.saveToField.trim()) {
            invalidSteps.push(`Step ${index + 1} (${step.stepId}): Dynamic Availability requires "Save To Field"`);
          }
        }
        // WhatsApp API limits
        if (step.type === 'interactive_buttons' && step.content?.buttons?.length) {
          if (step.content.buttons.length > WHATSAPP_LIMITS.BUTTONS.MAX_PER_MESSAGE) {
            invalidSteps.push(`Step ${index + 1} (${step.stepId}): Max ${WHATSAPP_LIMITS.BUTTONS.MAX_PER_MESSAGE} buttons allowed. Chain steps for more options.`);
          }
          step.content.buttons.forEach((btn: any, i: number) => {
            const t = (btn.text?.en || btn.text || btn.title || '').trim();
            if (t.length > WHATSAPP_LIMITS.BUTTONS.TITLE_MAX_LENGTH) {
              invalidSteps.push(`Step ${index + 1}, Button ${i + 1}: Title max ${WHATSAPP_LIMITS.BUTTONS.TITLE_MAX_LENGTH} characters.`);
            }
          });
        }
        if (step.type === 'interactive_list' && step.content?.listSource !== 'departments' && step.content?.buttons?.length) {
          if (step.content.buttons.length > WHATSAPP_LIMITS.LIST.MAX_ROWS_PER_SECTION) {
            invalidSteps.push(`Step ${index + 1} (${step.stepId}): Max ${WHATSAPP_LIMITS.LIST.MAX_ROWS_PER_SECTION} list rows. Use "Departments (dynamic)" or pagination.`);
          }
          step.content.buttons.forEach((btn: any, i: number) => {
            const title = (btn.text?.en || btn.text || btn.title || '').trim();
            const desc = (btn.description || '').trim();
            if (title.length > WHATSAPP_LIMITS.LIST.ROW_TITLE_MAX_LENGTH) {
              invalidSteps.push(`Step ${index + 1}, Row ${i + 1}: Title max ${WHATSAPP_LIMITS.LIST.ROW_TITLE_MAX_LENGTH} characters.`);
            }
            if (desc.length > WHATSAPP_LIMITS.LIST.ROW_DESCRIPTION_MAX_LENGTH) {
              invalidSteps.push(`Step ${index + 1}, Row ${i + 1}: Description max ${WHATSAPP_LIMITS.LIST.ROW_DESCRIPTION_MAX_LENGTH} characters.`);
            }
          });
        }
      });

      if (invalidSteps.length > 0) {
        toast.error(`Please fix the following:\n${invalidSteps.join('\n')}`, { duration: 6000 });
        return;
      }

      setSaving(true);
      
      console.log('📤 Sending flow to backend:', { 
        name: flow.name, 
        stepsCount: flow.steps.length,
        companyId: flow.companyId,
        editFlowId: editFlowId
      });
      
      // Use PUT for editing, POST for creating
      const res = editFlowId 
        ? await apiClient.put(`/chatbot-flows/${editFlowId}`, flow)
        : await apiClient.post('/chatbot-flows', flow);
      
      console.log('📥 Response received:', {
        success: res?.success,
        message: res?.message,
        hasData: !!res?.data
      });
      
      // apiClient.post()/put() returns response.data directly, not the full response
      // So res is already the data object
      if (res?.success === true) {
        // Success - flow was created/updated
        toast.success(res.message || (editFlowId ? 'Flow updated successfully' : 'Flow created successfully'));
        router.push(`/superadmin/company/${companyId}/chatbot-flows`);
        return;
      }
      
      // If success is false or undefined, show error but still redirect if data exists
      if (res?.data) {
        // Flow was saved but response format is unexpected
        console.warn('⚠️ Flow saved but unexpected response format:', res);
        toast.success('Flow saved successfully');
        router.push(`/superadmin/company/${companyId}/chatbot-flows`);
        return;
      }
      
      // No data in response - show error
      toast.error(res?.message || 'Failed to save flow');
    } catch (error: any) {
      console.error('❌ Failed to save flow:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Show detailed validation errors if available
      if (error.response?.data?.validationErrors) {
        const validationErrors = error.response.data.validationErrors;
        const errorMessages = Object.keys(validationErrors).slice(0, 5).map(key => {
          return `${key}: ${validationErrors[key]}`;
        }).join('\n');
        
        const moreErrors = Object.keys(validationErrors).length > 5 
          ? `\n... and ${Object.keys(validationErrors).length - 5} more errors`
          : '';
        
        toast.error(
          `Validation failed:\n${errorMessages}${moreErrors}`,
          { duration: 8000 }
        );
      } else if (error.response?.data?.error) {
        // Show the specific error message
        const errorMsg = error.response.data.error;
        // If it's a long validation error, show first part
        if (errorMsg.length > 200) {
          toast.error(errorMsg.substring(0, 200) + '...', { duration: 8000 });
        } else {
          toast.error(errorMsg, { duration: 5000 });
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, { duration: 5000 });
      } else {
        toast.error('Failed to save flow. Please check browser console (F12) for details.');
      }
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    const newStep = {
      stepId: `step_${flow.steps.length + 1}`,
      type: 'message',
      content: {
        text: {
          en: 'Enter your message here'
        }
      },
      nextStep: null
    };
    setFlow({
      ...flow,
      steps: [...flow.steps, newStep]
    });
    setSelectedStepIndex(flow.steps.length);
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...flow.steps];
    const keys = field.split('.');
    let current = newSteps[index];
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setFlow({ ...flow, steps: newSteps });
  };

  const deleteStep = (index: number) => {
    const newSteps = flow.steps.filter((_: any, i: number) => i !== index);
    setFlow({ ...flow, steps: newSteps });
    if (selectedStepIndex === index) {
      setSelectedStepIndex(null);
    }
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === flow.steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...flow.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setFlow({ ...flow, steps: newSteps });
    
    if (selectedStepIndex === index) {
      setSelectedStepIndex(targetIndex);
    } else if (selectedStepIndex === targetIndex) {
      setSelectedStepIndex(index);
    }
  };

  const addButton = (stepIndex: number) => {
    const newSteps = [...flow.steps];
    if (!newSteps[stepIndex].content.buttons) {
      newSteps[stepIndex].content.buttons = [];
    }
    const newButtonId = `btn_${newSteps[stepIndex].content.buttons.length + 1}`;
    newSteps[stepIndex].content.buttons.push({
      id: newButtonId,
      text: { en: 'Button Text' },
      type: 'reply'
    });
    
    // Auto-generate expected response for this button
    const step = newSteps[stepIndex];
    if (step.type === 'interactive_buttons' || step.type === 'interactive_list') {
      if (!step.expectedResponses) {
        step.expectedResponses = [];
      }
      // Check if response already exists for this button
      const existing = step.expectedResponses.find((r: any) => r.value === newButtonId);
      if (!existing) {
        const responseType = step.type === 'interactive_buttons' ? 'button_click' : 'list_selection';
        step.expectedResponses.push({
          type: responseType,
          value: newButtonId,
          nextStepId: ''
        });
      }
    }
    
    setFlow({ ...flow, steps: newSteps });
  };

  const updateButton = (stepIndex: number, buttonIndex: number, field: string, value: any) => {
    const newSteps = [...flow.steps];
    const keys = field.split('.');
    let current = newSteps[stepIndex].content.buttons[buttonIndex];
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setFlow({ ...flow, steps: newSteps });
  };

  const deleteButton = (stepIndex: number, buttonIndex: number) => {
    const newSteps = [...flow.steps];
    newSteps[stepIndex].content.buttons = newSteps[stepIndex].content.buttons.filter(
      (_: any, i: number) => i !== buttonIndex
    );
    setFlow({ ...flow, steps: newSteps });
  };

  const handleTemplateSelect = (template: FlowTemplate) => {
    // Merge template into existing flow instead of replacing it
    // 1) Steps: always append template steps at the end
    // 2) Triggers: 
    //    - If flow only has the initial default "hi" trigger and template defines triggers,
    //      replace with template triggers.
    //    - Otherwise, merge template triggers, avoiding duplicates.
    const hasOnlyDefaultHiTrigger =
      flow.triggers &&
      flow.triggers.length === 1 &&
      flow.triggers[0].type === 'keyword' &&
      (flow.triggers[0].value === 'hi' || flow.triggers[0].value === 'Hi');

    let newTriggers = flow.triggers;

    if (template.triggers.length > 0) {
      if (hasOnlyDefaultHiTrigger) {
        // First meaningful template: let it define the triggers
        newTriggers = template.triggers;
      } else {
        // Merge triggers without duplicates (by type + value)
        const existingKeys = new Set(
          (flow.triggers || []).map(
            (t: any) => `${t.type || t.triggerType}:${t.value || t.triggerValue}`
          )
        );
        const merged = [...(flow.triggers || [])];
        template.triggers.forEach((t: any) => {
          const key = `${t.type || t.triggerType}:${t.value || t.triggerValue}`;
          if (!existingKeys.has(key)) {
            merged.push(t);
            existingKeys.add(key);
          }
        });
        newTriggers = merged;
      }
    }

    setFlow({
      ...flow,
      triggers: newTriggers,
      steps: [...flow.steps, ...template.steps]
    });
    // Keep template panel open so user can add multiple templates easily
    toast.success(`Template "${template.name}" added!`);
    // Select the first new step
    if (template.steps.length > 0) {
      setSelectedStepIndex(flow.steps.length);
    }
  };

  const addLanguageSelectionFlow = () => {
    const languageStep = {
      stepId: 'language_selection',
      type: 'interactive_buttons',
      content: {
        text: {
          en: '🇮🇳 *Welcome*\n\nPlease select your preferred language:\n\n👇 *Choose an option:*'
        },
        buttons: [
          { id: 'lang_en', text: { en: '🇬🇧 English' }, nextStep: 'main_menu_en' },
          { id: 'lang_hi', text: { en: '🇮🇳 हिंदी' }, nextStep: 'main_menu_hi' },
          { id: 'lang_or', text: { en: '🇮🇳 ଓଡ଼ିଆ' }, nextStep: 'main_menu_or' }
        ]
      },
      expectedResponses: [
        { type: 'button_click', value: 'lang_en', nextStepId: 'main_menu_en' },
        { type: 'button_click', value: 'lang_hi', nextStepId: 'main_menu_hi' },
        { type: 'button_click', value: 'lang_or', nextStepId: 'main_menu_or' }
      ],
      nextStep: null
    };

    const mainMenuEn = {
      stepId: 'main_menu_en',
      type: 'interactive_buttons',
      content: {
        text: {
          en: '🏛️ *Main Menu*\n\nWelcome! How can we help you today?\n\n👇 *Select a service:*'
        },
        buttons: []
      },
      nextStep: null
    };

    setFlow({
      ...flow,
      steps: [...flow.steps, languageStep, mainMenuEn]
    });
    setSelectedStepIndex(flow.steps.length);
    toast.success('Language selection flow added!');
  };

  // WhatsApp Preview Component
  const WhatsAppPreview = () => {
    const currentStep = selectedStepIndex !== null ? flow.steps[selectedStepIndex] : null;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
      <div className="sticky top-8">
        <div className="bg-white border-2 border-gray-300 rounded-[2.5rem] shadow-2xl overflow-hidden" style={{ maxWidth: '375px' }}>
          {/* Phone Frame Top */}
          <div className="bg-black h-6 rounded-t-[2.5rem] flex items-center justify-center">
            <div className="w-32 h-1 bg-gray-700 rounded-full"></div>
          </div>

          {/* WhatsApp Header */}
          <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-green-800 font-bold text-sm">B</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Business Chatbot</p>
              <p className="text-xs text-green-100 opacity-90">online</p>
            </div>
            <div className="flex gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </div>
          </div>

          {/* Chat Area with WhatsApp Background Pattern */}
          <div 
            className="min-h-[500px] max-h-[600px] overflow-y-auto p-3 space-y-2 relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4e8d1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: '#e5ddd5'
            }}
          >
            {/* Trigger Messages (User) */}
            {flow.triggers && flow.triggers.length > 0 && flow.triggers.map((trigger: any, idx: number) => (
              trigger.value && (
                <div key={idx} className="flex justify-end mb-2">
                  <div className="bg-[#dcf8c6] rounded-lg px-3 py-1.5 max-w-[75%] shadow-sm relative" style={{ borderRadius: '7.5px 7.5px 0 7.5px' }}>
                    <p className="text-sm text-gray-800 leading-relaxed">{trigger.value}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-gray-500">{timeStr}</span>
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )
            ))}

            {/* Flow Steps (Bot Messages) */}
            {flow.steps.map((step: any, index: number) => (
              <div 
                key={index} 
                className={`flex justify-start mb-2 transition-all ${selectedStepIndex === index ? 'ring-2 ring-blue-400 ring-offset-2 rounded-lg p-1' : ''}`}
              >
                <div className="bg-white rounded-lg px-3 py-2 max-w-[85%] shadow-sm relative" style={{ borderRadius: '0 7.5px 7.5px 7.5px' }}>
                  {/* Step Label (only in edit mode) */}
                  {selectedStepIndex === index && (
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-100">
                      <span className="w-5 h-5 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">{step.stepId}</span>
                    </div>
                  )}

                  {/* Message Text */}
                  {step.content?.text?.en && (
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-1">
                      {step.content.text.en}
                    </p>
                  )}

                  {/* Buttons */}
                  {step.content?.buttons && step.content.buttons.length > 0 && (
                    <div className="space-y-2 mt-3 pt-2 border-t border-gray-100">
                      {step.content.buttons.map((btn: any, btnIdx: number) => (
                        <button
                          key={btnIdx}
                          className="w-full bg-white border-2 border-[#25D366] text-[#25D366] rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                          style={{ borderRadius: '8px' }}
                        >
                          {btn.text?.en || 'Button'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center justify-start gap-1 mt-1.5">
                    <span className="text-[10px] text-gray-500">{timeStr}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {flow.steps.length === 0 && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Add steps to see preview</p>
                  <p className="text-xs mt-1">Your conversation will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Input Area */}
          <div className="bg-[#f0f0f0] px-3 py-2.5 flex items-center gap-2 border-t border-gray-300">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-gray-600">
              Type a message
            </div>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="p-2 bg-[#25D366] text-white rounded-full hover:bg-[#20ba5a]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>

          {/* Phone Frame Bottom */}
          <div className="bg-black h-6 rounded-b-[2.5rem]"></div>
        </div>

        {/* Preview Info */}
        <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
          <div className="flex items-start gap-2">
            <Eye className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-900">Live Preview</p>
              <p className="text-xs text-blue-700 mt-1">
                {selectedStepIndex !== null 
                  ? `Viewing Step ${selectedStepIndex + 1} of ${flow.steps.length}`
                  : flow.steps.length > 0
                  ? 'Select a step to highlight it in preview'
                  : 'Add steps to see your flow in action'}
              </p>
              {flow.triggers && flow.triggers.length > 0 && (
                <p className="text-[10px] text-blue-600 mt-1.5">
                  Triggers: {flow.triggers.map((t: any) => t.value).filter(Boolean).join(', ') || 'None'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 sticky top-0 z-50 shadow-xl">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
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
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {editFlowId ? 'Edit Chatbot Flow' : 'Create New Chatbot Flow'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Flow'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left Side - Flow Builder (Wider) */}
          <div className="space-y-6 min-w-0">
            {/* WhatsApp API Limits (reference) */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  WhatsApp Business API Limits
                </CardTitle>
                <CardDescription className="text-xs">
                  Non-negotiable platform constraints. Flow builder enforces these.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-gray-700">
                <p><strong>Buttons:</strong> Max {WHATSAPP_LIMITS.BUTTONS.MAX_PER_MESSAGE} per message, {WHATSAPP_LIMITS.BUTTONS.TITLE_MAX_LENGTH} chars each. Chain steps for more options.</p>
                <p><strong>Lists:</strong> Max {WHATSAPP_LIMITS.LIST.MAX_ROWS_PER_SECTION} rows, 1 section. Row title {WHATSAPP_LIMITS.LIST.ROW_TITLE_MAX_LENGTH} chars, description {WHATSAPP_LIMITS.LIST.ROW_DESCRIPTION_MAX_LENGTH} chars.</p>
                <p><strong>Session:</strong> Free-form messages only within {WHATSAPP_LIMITS.SESSION.WINDOW_HOURS}h of last user message.</p>
                <p><strong>Media:</strong> Image {WHATSAPP_LIMITS.MEDIA.IMAGE_MB}MB, Video {WHATSAPP_LIMITS.MEDIA.VIDEO_MB}MB, Document {WHATSAPP_LIMITS.MEDIA.DOCUMENT_MB}MB.</p>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>📝 Basic Information</CardTitle>
                <CardDescription>Configure the flow name, description, and trigger</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Flow Name *</Label>
                  <Input 
                    id="name"
                    placeholder="e.g., Main Grievance Flow"
                    value={flow.name} 
                    onChange={(e) => setFlow({ ...flow, name: e.target.value })}
                    className="text-base"
                  />
                  <p className="text-xs text-gray-500">Give your flow a descriptive name</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Describe what this flow does..."
                    value={flow.description}
                    onChange={(e) => setFlow({ ...flow, description: e.target.value })}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  />
                  <p className="text-xs text-gray-500">Explain when and why this flow should be used</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">🎯 Flow Triggers</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFlow({
                          ...flow,
                          triggers: [
                            ...flow.triggers,
                            { type: 'keyword', value: '', startStepId: '' }
                          ]
                        });
                      }}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Trigger
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">
                    Define when this flow should be activated. You can add multiple triggers (e.g., "hi", "hello", or button clicks like "lang_en", "lang_hi").
                  </p>

                  {flow.triggers.map((trigger: any, index: number) => (
                    <Card key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Trigger Type</Label>
                            <select
                              value={trigger.type}
                              onChange={(e) => {
                                const newTriggers = [...flow.triggers];
                                newTriggers[index] = { ...newTriggers[index], type: e.target.value };
                                setFlow({ ...flow, triggers: newTriggers });
                              }}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                            >
                              <option value="keyword">📝 Keyword/Message</option>
                              <option value="button_click">🔘 Button Click</option>
                              <option value="menu_selection">📋 Menu Selection</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Trigger Value</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="e.g., hi, lang_en"
                                value={trigger.value}
                                onChange={(e) => {
                                  const newTriggers = [...flow.triggers];
                                  newTriggers[index] = { ...newTriggers[index], value: e.target.value };
                                  setFlow({ ...flow, triggers: newTriggers });
                                }}
                                className="h-9 text-xs"
                              />
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const newTriggers = [...flow.triggers];
                                    newTriggers[index] = { ...newTriggers[index], value: e.target.value };
                                    setFlow({ ...flow, triggers: newTriggers });
                                    e.target.value = '';
                                  }
                                }}
                                className="h-9 w-32 rounded-md border border-input bg-background px-2 py-1 text-xs"
                                title="Quick select preset"
                              >
                                <option value="">Presets...</option>
                                <optgroup label="Common Messages">
                                  <option value="hi">hi</option>
                                  <option value="hello">hello</option>
                                  <option value="start">start</option>
                                  <option value="menu">menu</option>
                                  <option value="help">help</option>
                                </optgroup>
                                <optgroup label="Language Buttons">
                                  <option value="lang_en">lang_en (English)</option>
                                  <option value="lang_hi">lang_hi (Hindi)</option>
                                  <option value="lang_mr">lang_mr (Marathi)</option>
                                  <option value="lang_or">lang_or (Odia)</option>
                                </optgroup>
                                <optgroup label="Service Buttons">
                                  <option value="grievance">grievance</option>
                                  <option value="appointment">appointment</option>
                                  <option value="track">track</option>
                                  <option value="rts">rts</option>
                                </optgroup>
                              </select>
                            </div>
                          </div>
                        </div>
                        {flow.triggers.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setFlow({
                                ...flow,
                                triggers: flow.triggers.filter((_: any, i: number) => i !== index)
                              });
                            }}
                            className="mt-6"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2">
                        {trigger.type === 'keyword' && 'User types this message to start the flow'}
                        {trigger.type === 'button_click' && 'User clicks a button with this ID to start the flow'}
                        {trigger.type === 'menu_selection' && 'User selects this option from a menu'}
                      </p>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {flow.steps.length === 0 && (
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg">🚀 Quick Start</CardTitle>
                  <CardDescription>Get started quickly with templates or common patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={() => setShowTemplates(!showTemplates)} 
                      variant="outline"
                      className="bg-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Browse Templates
                    </Button>
                    <Button 
                      onClick={addLanguageSelectionFlow} 
                      variant="outline"
                      className="bg-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Add Language Selection
                    </Button>
                    <Button 
                      onClick={addStep} 
                      variant="outline"
                      className="bg-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start from Scratch
                    </Button>
                  </div>
                  
                  {showTemplates && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <FlowTemplates onSelectTemplate={handleTemplateSelect} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Steps */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle>🔄 Flow Steps ({flow.steps.length})</CardTitle>
                        <CardDescription>Build your conversation flow step by step</CardDescription>
                      </div>
                      {flow.steps.length > 0 && (
                        <div className="flex items-center gap-2 ml-auto">
                          <Label className="text-xs text-gray-500">Jump to:</Label>
                          <select
                            value={selectedStepIndex !== null ? selectedStepIndex : ''}
                            onChange={(e) => {
                              const idx = parseInt(e.target.value);
                              if (!isNaN(idx)) {
                                setSelectedStepIndex(idx);
                                // Scroll to step
                                setTimeout(() => {
                                  const element = document.getElementById(`step-${idx}`);
                                  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 100);
                              }
                            }}
                            className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                          >
                            <option value="">Select step...</option>
                            {flow.steps.map((step: any, idx: number) => (
                              <option key={idx} value={idx}>
                                Step {idx + 1}: {step.stepId || 'Unnamed'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  {flow.steps.length > 0 && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => setShowTemplates(!showTemplates)}
                        size="sm"
                        variant="outline"
                        className="bg-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Browse Templates
                      </Button>
                      <Button onClick={addStep} size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Step
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {flow.steps.length > 0 && showTemplates && (
                  <div className="mb-6 border border-purple-200 rounded-xl p-4 bg-purple-50/50">
                    <FlowTemplates onSelectTemplate={handleTemplateSelect} />
                  </div>
                )}
                {flow.steps.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-semibold mb-1">No steps added yet</p>
                    <p className="text-sm mb-4">Click "Add Step" to start building your flow</p>
                    <Button onClick={addStep} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Step
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {flow.steps.map((step: any, stepIndex: number) => {
                      // Find which steps connect to this one
                      const connectedFrom = flow.steps
                        .map((s: any, idx: number) => {
                          if (s.nextStep === step.stepId) return idx;
                          if (s.expectedResponses?.some((r: any) => r.nextStepId === step.stepId)) return idx;
                          if (s.content?.buttons?.some((b: any) => b.nextStep === step.stepId)) return idx;
                          return null;
                        })
                        .filter((idx: any) => idx !== null);

                      return (
                      <Card 
                        key={stepIndex}
                        id={`step-${stepIndex}`}
                        className={`border-2 transition-all cursor-pointer ${
                          selectedStepIndex === stepIndex 
                            ? 'border-blue-500 shadow-lg bg-blue-50/30' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                        onClick={() => setSelectedStepIndex(stepIndex)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                {stepIndex + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <CardTitle className="text-lg">Step {stepIndex + 1}: {step.stepId || 'Unnamed'}</CardTitle>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                    {step.type === 'message' && '💬 Message'}
                                    {step.type === 'interactive_buttons' && '🔘 Buttons'}
                                    {step.type === 'interactive_list' && '📋 List'}
                                    {step.type === 'collect_input' && '✍️ Input'}
                                    {step.type === 'dynamic_availability' && '🗓️ Availability'}
                                    {step.type === 'media' && '🖼️ Media'}
                                    {!['message','interactive_buttons','interactive_list','collect_input','dynamic_availability','media'].includes(step.type) && step.type}
                                  </span>
                                </div>
                                {connectedFrom.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    ← Connected from: {connectedFrom.map((idx: number) => `Step ${idx + 1}`).join(', ')}
                                  </p>
                                )}
                              </div>
                              {selectedStepIndex === stepIndex && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                  Editing
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); moveStep(stepIndex, 'up'); }}
                                disabled={stepIndex === 0}
                                title="Move Up"
                              >
                                <MoveUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); moveStep(stepIndex, 'down'); }}
                                disabled={stepIndex === flow.steps.length - 1}
                                title="Move Down"
                              >
                                <MoveDown className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => { e.stopPropagation(); deleteStep(stepIndex); }}
                                title="Delete Step"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Step ID *</Label>
                            <Input 
                              value={step.stepId}
                              onChange={(e) => updateStep(stepIndex, 'stepId', e.target.value)}
                              placeholder="e.g., language_selection"
                              onClick={(e) => e.stopPropagation()}
                            />
                            {step.stepId === 'grievance_category' && (
                              <div className="p-2 bg-green-50 border border-green-200 rounded-lg mt-1">
                                <p className="text-[10px] text-green-800">
                                  <strong>💡 Auto-Load Departments:</strong> This step will automatically load departments from your company's database when executed. Keep step type as "Message" for this to work.
                                </p>
                              </div>
                            )}
                          </div>
                            
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold">Step Type *</Label>
                              <select
                                value={step.type}
                                onChange={(e) => {
                                  const newType = e.target.value;
                                  updateStep(stepIndex, 'type', newType);
                                  
                                  // Auto-detect and set response type based on step type
                                  const newSteps = [...flow.steps];
                                  let autoResponseType = 'text';
                                  
                                  if (newType === 'interactive_buttons') {
                                    autoResponseType = 'button_click';
                                  } else if (newType === 'interactive_list') {
                                    autoResponseType = 'list_selection';
                                  } else if (newType === 'collect_input') {
                                    autoResponseType = 'any';
                                  }
                                  
                                  // If step has buttons and no expected responses, auto-generate them
                                  if ((newType === 'interactive_buttons' || newType === 'interactive_list') && 
                                      step.content?.buttons && step.content.buttons.length > 0) {
                                    if (!newSteps[stepIndex].expectedResponses) {
                                      newSteps[stepIndex].expectedResponses = [];
                                    }
                                    // Add expected responses for each button
                                    step.content.buttons.forEach((btn: any) => {
                                      const existing = newSteps[stepIndex].expectedResponses.find(
                                        (r: any) => r.value === btn.id
                                      );
                                      if (!existing) {
                                        newSteps[stepIndex].expectedResponses.push({
                                          type: autoResponseType,
                                          value: btn.id,
                                          nextStepId: btn.nextStep || ''
                                        });
                                      }
                                    });
                                    setFlow({ ...flow, steps: newSteps });
                                  }
                                  
                                  // Initialize inputConfig when switching to collect_input
                                  if (newType === 'collect_input' && !step.content?.inputConfig) {
                                    updateStep(stepIndex, 'content.inputConfig', {
                                      inputType: 'text',
                                      saveToField: '',
                                      validation: {
                                        required: false,
                                        minLength: undefined,
                                        maxLength: undefined
                                      },
                                      placeholder: ''
                                    });
                                  }
                                  // Initialize availabilityConfig when switching to dynamic_availability
                                  if (newType === 'dynamic_availability' && !step.content?.availabilityConfig) {
                                    updateStep(stepIndex, 'content.availabilityConfig', {
                                      type: 'date',
                                      dateRange: {
                                        startDays: 0,
                                        endDays: 30
                                      },
                                      timeSlots: {
                                        showMorning: true,
                                        showAfternoon: true,
                                        showEvening: true
                                      },
                                      saveToField: '',
                                      departmentId: ''
                                    });
                                  }
                                  
                                  // Special handling for grievance_category - set to message type to trigger auto-load
                                  if (step.stepId === 'grievance_category' && newType !== 'message') {
                                    // Keep as message type for auto department loading
                                    console.log('⚠️ grievance_category should be "message" type for auto department loading');
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="message">💬 Message</option>
                                <option value="interactive_buttons">🔘 Interactive Buttons</option>
                                <option value="interactive_list">📋 Interactive List</option>
                                <option value="collect_input">✍️ Collect Input</option>
                                <option value="dynamic_availability">🗓️ Dynamic Availability</option>
                                <option value="media">🖼️ Media (Image/Video)</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Message Text (English) *</Label>
                            <textarea
                              rows={3}
                              value={step.content?.text?.en || ''}
                              onChange={(e) => updateStep(stepIndex, 'content.text.en', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              placeholder="Enter the message users will see..."
                            />
                            <p className="text-xs text-gray-500">This is what the bot will send</p>
                          </div>

                          {/* Input Configuration for Collect Input steps */}
                          {step.type === 'collect_input' && (
                            <div className="space-y-3 pt-2 border-t border-gray-200">
                              <Label className="text-xs font-semibold">📥 Input Configuration</Label>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-xs">Input Type</Label>
                                  <select
                                    value={step.content?.inputConfig?.inputType || 'text'}
                                    onChange={(e) => updateStep(stepIndex, 'content.inputConfig.inputType', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                  >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                    <option value="date">Date</option>
                                    <option value="image">📷 Image (PNG, JPG, WEBP - Auto uploads to Cloudinary)</option>
                                    <option value="document">📄 Document</option>
                                    <option value="location">📍 Location (Lat/Long)</option>
                                  </select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-xs">Save To Field</Label>
                                  <select
                                    value={
                                      step.content?.inputConfig?.saveToField
                                        ? SAVE_TO_FIELD_OPTIONS.some(o => o.value === step.content.inputConfig.saveToField)
                                          ? step.content.inputConfig.saveToField
                                          : 'custom'
                                        : ''
                                    }
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      updateStep(stepIndex, 'content.inputConfig.saveToField', v === 'custom' ? (step.content?.inputConfig?.saveToField && !SAVE_TO_FIELD_OPTIONS.some(o => o.value === step.content.inputConfig.saveToField) ? step.content.inputConfig.saveToField : '') : v);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                  >
                                    <option value="">— Select field —</option>
                                    {['Grievance / Appointment', 'Grievance', 'Appointment', 'Tracking', 'Media', 'Other'].map(group => (
                                      <optgroup key={group} label={group}>
                                        {SAVE_TO_FIELD_OPTIONS.filter(o => (o.group || 'Other') === group && o.value !== 'custom').map(opt => (
                                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                      </optgroup>
                                    ))}
                                    <option value="custom">— Other (type below) —</option>
                                  </select>
                                  {(!step.content?.inputConfig?.saveToField || !SAVE_TO_FIELD_OPTIONS.some(o => o.value === step.content?.inputConfig?.saveToField)) && (
                                    <Input
                                      placeholder="e.g., citizenName, description, myField"
                                      value={step.content?.inputConfig?.saveToField || ''}
                                      onChange={(e) => updateStep(stepIndex, 'content.inputConfig.saveToField', e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-9 text-xs mt-1"
                                    />
                                  )}
                                  <p className="text-[10px] text-gray-500">Stored in session/DB; use in messages as {'{'}fieldName{'}'}</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={step.content?.inputConfig?.validation?.required || false}
                                    onChange={(e) => updateStep(stepIndex, 'content.inputConfig.validation.required', e.target.checked)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4"
                                  />
                                  <Label className="text-xs">Required</Label>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-xs">Min Length</Label>
                                  <Input
                                    type="number"
                                    placeholder="e.g., 3"
                                    value={step.content?.inputConfig?.validation?.minLength || ''}
                                    onChange={(e) => updateStep(stepIndex, 'content.inputConfig.validation.minLength', e.target.value ? parseInt(e.target.value) : undefined)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-9 text-xs"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-xs">Max Length</Label>
                                  <Input
                                    type="number"
                                    placeholder="e.g., 500"
                                    value={step.content?.inputConfig?.validation?.maxLength || ''}
                                    onChange={(e) => updateStep(stepIndex, 'content.inputConfig.validation.maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-9 text-xs"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs">Placeholder Text (Optional)</Label>
                                <Input
                                  placeholder="e.g., Enter your name here"
                                  value={step.content?.inputConfig?.placeholder || ''}
                                  onChange={(e) => updateStep(stepIndex, 'content.inputConfig.placeholder', e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-9 text-xs"
                                />
                              </div>

                              {/* Helper info for specific input types */}
                              {step.content?.inputConfig?.inputType === 'image' && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <p className="text-xs text-blue-800">
                                    <strong>📷 Image Upload:</strong> Images will be automatically uploaded to Cloudinary and stored securely. 
                                    The URL will be saved to the field specified above.
                                  </p>
                                </div>
                              )}
                              
                              {step.content?.inputConfig?.inputType === 'location' && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <p className="text-xs text-green-800">
                                    <strong>📍 Location:</strong> Users can share their location via WhatsApp. 
                                    The system will automatically extract latitude and longitude and save as: 
                                    <code className="bg-white px-1 rounded">{"{location.latitude}"}</code> and 
                                    <code className="bg-white px-1 rounded">{"{location.longitude}"}</code>
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Dynamic Availability Configuration */}
                          {step.type === 'dynamic_availability' && (
                            <div className="space-y-3 pt-2 border-t border-gray-200">
                              <Label className="text-xs font-semibold">🗓️ Availability Configuration</Label>
                              <p className="text-xs text-gray-500 italic">
                                Buttons will be generated dynamically from company admin's availability settings.
                              </p>
                              
                              <div className="space-y-2">
                                <Label className="text-xs">Availability Type</Label>
                                <select
                                  value={step.content?.availabilityConfig?.type || 'date'}
                                  onChange={(e) => updateStep(stepIndex, 'content.availabilityConfig.type', e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                >
                                  <option value="date">Date Selection</option>
                                  <option value="time">Time Selection</option>
                                  <option value="datetime">Date & Time</option>
                                </select>
                                <p className="text-[10px] text-gray-500">What should users select?</p>
                              </div>

                              {(step.content?.availabilityConfig?.type === 'date' || step.content?.availabilityConfig?.type === 'datetime') && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label className="text-xs">Start Days</Label>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={step.content?.availabilityConfig?.dateRange?.startDays || 0}
                                      onChange={(e) => updateStep(stepIndex, 'content.availabilityConfig.dateRange.startDays', parseInt(e.target.value) || 0)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-9 text-xs"
                                    />
                                    <p className="text-[10px] text-gray-500">Days from today</p>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label className="text-xs">End Days</Label>
                                    <Input
                                      type="number"
                                      placeholder="30"
                                      value={step.content?.availabilityConfig?.dateRange?.endDays || 30}
                                      onChange={(e) => updateStep(stepIndex, 'content.availabilityConfig.dateRange.endDays', parseInt(e.target.value) || 30)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-9 text-xs"
                                    />
                                    <p className="text-[10px] text-gray-500">Days ahead to show</p>
                                  </div>
                                </div>
                              )}

                              {(step.content?.availabilityConfig?.type === 'time' || step.content?.availabilityConfig?.type === 'datetime') && (
                                <div className="space-y-2">
                                  <Label className="text-xs">Time Slots to Show</Label>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={step.content?.availabilityConfig?.timeSlots?.showMorning !== false}
                                        onChange={(e) => updateStep(stepIndex, 'content.availabilityConfig.timeSlots.showMorning', e.target.checked)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4"
                                      />
                                      <Label className="text-xs">Morning (9 AM - 12 PM)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={step.content?.availabilityConfig?.timeSlots?.showAfternoon !== false}
                                        onChange={(e) => updateStep(stepIndex, 'content.availabilityConfig.timeSlots.showAfternoon', e.target.checked)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4"
                                      />
                                      <Label className="text-xs">Afternoon (2 PM - 5 PM)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={step.content?.availabilityConfig?.timeSlots?.showEvening === true}
                                        onChange={(e) => updateStep(stepIndex, 'content.availabilityConfig.timeSlots.showEvening', e.target.checked)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4"
                                      />
                                      <Label className="text-xs">Evening (5 PM - 7 PM)</Label>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-2">
                                <Label className="text-xs">Save To Field *</Label>
                                <select
                                  value={step.content?.availabilityConfig?.saveToField || ''}
                                  onChange={(e) => updateStep(stepIndex, 'content.availabilityConfig.saveToField', e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                >
                                  <option value="">— Select field —</option>
                                  {AVAILABILITY_SAVE_TO_FIELD_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                                <p className="text-[10px] text-gray-500">Where to save selected date/time (e.g. appointmentDate, appointmentTime)</p>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs">Department ID (Optional)</Label>
                                <Input
                                  placeholder="Leave empty for company-wide availability"
                                  value={step.content?.availabilityConfig?.departmentId || ''}
                                  onChange={(e) => updateStep(stepIndex, 'content.availabilityConfig.departmentId', e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-9 text-xs"
                                />
                                <p className="text-[10px] text-gray-500">For department-specific availability</p>
                              </div>
                            </div>
                          )}

                          {/* List source (for Interactive List only) */}
                          {step.type === 'interactive_list' && (
                            <div className="space-y-3 pt-2 border-t border-gray-200">
                              <Label className="text-xs font-semibold">📋 List Source</Label>
                              <select
                                value={step.content?.listSource || 'manual'}
                                onChange={(e) => updateStep(stepIndex, 'content.listSource', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                              >
                                <option value="manual">Manual – define list items below</option>
                                <option value="departments">Departments (dynamic) – load from company departments</option>
                              </select>
                              {step.content?.listSource === 'departments' ? (
                                <div className="space-y-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <p className="text-xs text-green-800">
                                    List options will be loaded from this company&apos;s departments at runtime. Selected department is saved as category/departmentId.
                                  </p>
                                  <div className="space-y-2">
                                    <Label className="text-xs">List button text (e.g. &quot;Select Department&quot;)</Label>
                                    <Input
                                      placeholder="Select Department"
                                      value={step.content?.listButtonText || ''}
                                      onChange={(e) => updateStep(stepIndex, 'content.listButtonText', e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-9 text-xs"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Label className="text-xs">List button text</Label>
                                  <Input
                                    placeholder="e.g. Select an option"
                                    value={step.content?.listButtonText || ''}
                                    onChange={(e) => updateStep(stepIndex, 'content.listButtonText', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-9 text-xs"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Buttons - Show for interactive steps AND collect_input steps (for list: only when manual) */}
                          {(step.type === 'interactive_buttons' || step.type === 'collect_input' || (step.type === 'interactive_list' && step.content?.listSource !== 'departments')) && (
                            <div className="space-y-3 pt-2 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold">
                                  {step.type === 'collect_input' ? '🔘 Action Buttons (Optional)' : step.type === 'interactive_list' ? '📋 List Items' : '🔘 Buttons'}
                                </Label>
                                <div className="flex items-center gap-2">
                                  {step.type === 'interactive_buttons' && (
                                    <span className="text-[10px] text-amber-600 font-medium">
                                      Max {WHATSAPP_LIMITS.BUTTONS.MAX_PER_MESSAGE} • {WHATSAPP_LIMITS.BUTTONS.TITLE_MAX_LENGTH} chars each
                                    </span>
                                  )}
                                  {step.type === 'interactive_list' && step.content?.listSource !== 'departments' && (
                                    <span className="text-[10px] text-amber-600 font-medium">
                                      Max {WHATSAPP_LIMITS.LIST.MAX_ROWS_PER_SECTION} rows • Title {WHATSAPP_LIMITS.LIST.ROW_TITLE_MAX_LENGTH} • Desc {WHATSAPP_LIMITS.LIST.ROW_DESCRIPTION_MAX_LENGTH} chars
                                    </span>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => { e.stopPropagation(); addButton(stepIndex); }}
                                    disabled={(step.type === 'interactive_buttons' && (step.content?.buttons?.length ?? 0) >= WHATSAPP_LIMITS.BUTTONS.MAX_PER_MESSAGE) || (step.type === 'interactive_list' && step.content?.listSource !== 'departments' && (step.content?.buttons?.length ?? 0) >= WHATSAPP_LIMITS.LIST.MAX_ROWS_PER_SECTION)}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Button
                                  </Button>
                                </div>
                              </div>
                              {step.type === 'collect_input' && (
                                <p className="text-xs text-gray-500 italic">
                                  Add buttons like "Back" or "Cancel" to allow users to navigate or exit the input step.
                                </p>
                              )}
                              {step.type === 'interactive_list' && (
                                <p className="text-xs text-gray-500 italic">
                                  Each item appears as a row in the WhatsApp list. Set &quot;Next Step&quot; in Expected Responses or use default next step.
                                </p>
                              )}
                              {(!step.content?.buttons || step.content.buttons.length === 0) && (
                                <p className="text-xs text-gray-500 italic">
                                  {step.type === 'collect_input' 
                                    ? 'No buttons added. Users will only be able to type text input.'
                                    : step.type === 'interactive_list'
                                    ? 'No list items. Click "Add Button" to add rows.'
                                    : 'No buttons added. Click "Add Button" to create interactive options.'}
                                </p>
                              )}
                              {step.content?.buttons?.map((button: any, btnIndex: number) => (
                                <Card key={btnIndex} className="p-3 bg-gray-50">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                      <div>
                                        <Label className="text-xs">Button ID</Label>
                                        <Input
                                          placeholder="btn_1"
                                          value={button.id}
                                          onChange={(e) => updateButton(stepIndex, btnIndex, 'id', e.target.value)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs flex items-center justify-between">
                                          {step.type === 'interactive_list' ? 'Row Title' : 'Button Text'}
                                          {(step.type === 'interactive_buttons' && (
                                            <span className={`font-normal ${(button.text?.en || '').length > WHATSAPP_LIMITS.BUTTONS.TITLE_MAX_LENGTH ? 'text-red-600' : 'text-gray-400'}`}>
                                              {(button.text?.en || '').length}/{WHATSAPP_LIMITS.BUTTONS.TITLE_MAX_LENGTH}
                                            </span>
                                          )) || (step.type === 'interactive_list' && (
                                            <span className={`font-normal ${(button.text?.en || '').length > WHATSAPP_LIMITS.LIST.ROW_TITLE_MAX_LENGTH ? 'text-red-600' : 'text-gray-400'}`}>
                                              {(button.text?.en || '').length}/{WHATSAPP_LIMITS.LIST.ROW_TITLE_MAX_LENGTH}
                                            </span>
                                          ))}
                                        </Label>
                                        <Input
                                          placeholder={step.type === 'interactive_list' ? `Row title (max ${WHATSAPP_LIMITS.LIST.ROW_TITLE_MAX_LENGTH})` : 'Click here (max 20 chars)'}
                                          value={button.text?.en || ''}
                                          onChange={(e) => {
                                            const max = step.type === 'interactive_buttons' ? WHATSAPP_LIMITS.BUTTONS.TITLE_MAX_LENGTH : step.type === 'interactive_list' ? WHATSAPP_LIMITS.LIST.ROW_TITLE_MAX_LENGTH : 999;
                                            updateButton(stepIndex, btnIndex, 'text.en', e.target.value.slice(0, max));
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="mt-1"
                                          maxLength={step.type === 'interactive_buttons' ? WHATSAPP_LIMITS.BUTTONS.TITLE_MAX_LENGTH : step.type === 'interactive_list' ? WHATSAPP_LIMITS.LIST.ROW_TITLE_MAX_LENGTH : undefined}
                                        />
                                      </div>
                                      {step.type === 'interactive_list' && (
                                        <div className="col-span-2">
                                          <Label className="text-xs flex items-center justify-between">
                                            Row Description (optional)
                                            <span className={`font-normal ${(button.description || '').length > WHATSAPP_LIMITS.LIST.ROW_DESCRIPTION_MAX_LENGTH ? 'text-red-600' : 'text-gray-400'}`}>
                                              {(button.description || '').length}/{WHATSAPP_LIMITS.LIST.ROW_DESCRIPTION_MAX_LENGTH}
                                            </span>
                                          </Label>
                                          <Input
                                            placeholder={`Optional description (max ${WHATSAPP_LIMITS.LIST.ROW_DESCRIPTION_MAX_LENGTH} chars)`}
                                            value={button.description || ''}
                                            onChange={(e) => updateButton(stepIndex, btnIndex, 'description', e.target.value.slice(0, WHATSAPP_LIMITS.LIST.ROW_DESCRIPTION_MAX_LENGTH))}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-1"
                                            maxLength={WHATSAPP_LIMITS.LIST.ROW_DESCRIPTION_MAX_LENGTH}
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={(e) => { e.stopPropagation(); deleteButton(stepIndex, btnIndex); }}
                                      className="mt-5"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}

                          {/* Expected Responses/Triggers Section */}
                          <div className="space-y-3 pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-semibold">🎯 Expected Responses/Triggers</Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newSteps = [...flow.steps];
                                  if (!newSteps[stepIndex].expectedResponses) {
                                    newSteps[stepIndex].expectedResponses = [];
                                  }
                                  
                                  // Auto-detect response type based on step type
                                  let autoType = 'text';
                                  if (step.type === 'interactive_buttons') {
                                    autoType = 'button_click';
                                  } else if (step.type === 'interactive_list') {
                                    autoType = 'list_selection';
                                  } else if (step.type === 'collect_input') {
                                    autoType = 'any';
                                  }
                                  
                                  newSteps[stepIndex].expectedResponses.push({
                                    type: autoType,
                                    value: '',
                                    nextStepId: step.nextStep || ''
                                  });
                                  setFlow({ ...flow, steps: newSteps });
                                }}
                                className="text-xs h-7"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Response
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 italic">
                              Define what user inputs or button clicks will trigger the next step. This helps route the conversation correctly.
                            </p>
                            
                            {(!step.expectedResponses || step.expectedResponses.length === 0) && (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-800">
                                  No expected responses defined. Users can proceed with any input or button click.
                                </p>
                              </div>
                            )}
                            
                            {step.expectedResponses && step.expectedResponses.map((response: any, respIndex: number) => (
                              <Card key={respIndex} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                      <Label className="text-xs font-semibold">Response Type</Label>
                                      <select
                                        value={response.type || 'text'}
                                        onChange={(e) => {
                                          const newSteps = [...flow.steps];
                                          newSteps[stepIndex].expectedResponses[respIndex].type = e.target.value;
                                          setFlow({ ...flow, steps: newSteps });
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                      >
                                        <option value="text">📝 Text/Message</option>
                                        <option value="button_click">🔘 Button Click</option>
                                        <option value="list_selection">📋 List Selection</option>
                                        <option value="any">✨ Any Input</option>
                                      </select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label className="text-xs font-semibold">Expected Value</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          placeholder="e.g., yes, no, lang_en"
                                          value={response.value || ''}
                                          onChange={(e) => {
                                            const newSteps = [...flow.steps];
                                            newSteps[stepIndex].expectedResponses[respIndex].value = e.target.value;
                                            setFlow({ ...flow, steps: newSteps });
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="h-8 text-xs"
                                          disabled={response.type === 'any'}
                                        />
                                        {response.type !== 'any' && (
                                          <select
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                const newSteps = [...flow.steps];
                                                newSteps[stepIndex].expectedResponses[respIndex].value = e.target.value;
                                                setFlow({ ...flow, steps: newSteps });
                                                e.target.value = '';
                                              }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-8 w-32 rounded-md border border-input bg-background px-2 py-1 text-xs"
                                            title="Quick select preset"
                                          >
                                            <option value="">Presets...</option>
                                            <optgroup label="Common">
                                              <option value="yes">yes</option>
                                              <option value="no">no</option>
                                              <option value="ok">ok</option>
                                              <option value="cancel">cancel</option>
                                            </optgroup>
                                            <optgroup label="Language">
                                              <option value="lang_en">lang_en</option>
                                              <option value="lang_hi">lang_hi</option>
                                              <option value="lang_mr">lang_mr</option>
                                              <option value="lang_or">lang_or</option>
                                            </optgroup>
                                            <optgroup label="Services">
                                              <option value="grievance">grievance</option>
                                              <option value="appointment">appointment</option>
                                              <option value="track">track</option>
                                            </optgroup>
                                            {(response.type === 'list_selection' || step.stepId === 'grievance_category') && (
                                              <optgroup label="Dynamic Options">
                                                <option value="grv_dept_*">📋 Department (Auto-loaded)</option>
                                                <option value="grv_load_more">📄 Load More Departments</option>
                                              </optgroup>
                                            )}
                                            {step.content?.buttons && step.content.buttons.length > 0 && (
                                              <optgroup label="Step Buttons">
                                                {step.content.buttons.map((btn: any) => (
                                                  <option key={btn.id} value={btn.id}>{btn.id}</option>
                                                ))}
                                              </optgroup>
                                            )}
                                          </select>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2 col-span-2">
                                      <Label className="text-xs font-semibold">Next Step ID (when this response is received)</Label>
                                      <select
                                        value={
                                          response.nextStepId && flow.steps.some((s: any) => s.stepId === response.nextStepId)
                                            ? response.nextStepId
                                            : response.nextStepId ? '__other__' : ''
                                        }
                                        onChange={(e) => {
                                          const v = e.target.value;
                                          const newSteps = [...flow.steps];
                                          newSteps[stepIndex].expectedResponses[respIndex].nextStepId = v === '__other__' ? (newSteps[stepIndex].expectedResponses[respIndex].nextStepId || '') : v;
                                          setFlow({ ...flow, steps: newSteps });
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                      >
                                        <option value="">— Leave empty (use default) —</option>
                                        {flow.steps.map((s: any, i: number) => (
                                          <option key={s.stepId} value={s.stepId}>Step {i + 1}: {s.stepId}</option>
                                        ))}
                                        <option value="__other__">— Other (type below) —</option>
                                      </select>
                                      {response.nextStepId && !flow.steps.some((s: any) => s.stepId === response.nextStepId) && (
                                        <Input
                                          placeholder="e.g., main_menu_en"
                                          value={response.nextStepId}
                                          onChange={(e) => {
                                            const newSteps = [...flow.steps];
                                            newSteps[stepIndex].expectedResponses[respIndex].nextStepId = e.target.value;
                                            setFlow({ ...flow, steps: newSteps });
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="h-8 text-xs mt-1"
                                        />
                                      )}
                                      <p className="text-[10px] text-gray-500">
                                        Which step to go to when user provides this response. Leave empty to use step's default next step.
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newSteps = [...flow.steps];
                                      newSteps[stepIndex].expectedResponses = newSteps[stepIndex].expectedResponses.filter(
                                        (_: any, i: number) => i !== respIndex
                                      );
                                      setFlow({ ...flow, steps: newSteps });
                                    }}
                                    className="mt-6 h-8"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Default Next Step ID (Optional)</Label>
                            <select
                              value={
                                step.nextStep && flow.steps.some((s: any) => s.stepId === step.nextStep)
                                  ? step.nextStep
                                  : step.nextStep ? '__other__' : ''
                              }
                              onChange={(e) => {
                                const v = e.target.value;
                                updateStep(stepIndex, 'nextStep', v === '__other__' ? (step.nextStep || '') : v || null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                            >
                              <option value="">— Leave empty (end flow) —</option>
                              {flow.steps.map((s: any, i: number) => (
                                <option key={s.stepId} value={s.stepId}>Step {i + 1}: {s.stepId}</option>
                              ))}
                              <option value="__other__">— Other (type below) —</option>
                            </select>
                            {step.nextStep && !flow.steps.some((s: any) => s.stepId === step.nextStep) && (
                              <Input
                                placeholder="e.g., main_menu_en"
                                value={step.nextStep || ''}
                                onChange={(e) => updateStep(stepIndex, 'nextStep', e.target.value || null)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-9 text-xs mt-1"
                              />
                            )}
                            <p className="text-xs text-gray-500">
                              Default next step if no specific expected response matches. Leave empty to end the flow.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - WhatsApp Preview (Fixed Position) */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <WhatsAppPreview />
          </div>
        </div>
      </main>
    </div>
  );
}
