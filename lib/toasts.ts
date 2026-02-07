import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

// ============================================================================
// TOAST UTILITIES
// ============================================================================

/**
 * Success toast with check icon
 */
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    icon: <CheckCircle2 className="h-5 w-5" />,
    duration: 4000,
  });
};

/**
 * Error toast with X icon
 */
export const showError = (message: string, description?: string) => {
  toast.error(message, {
    description,
    icon: <XCircle className="h-5 w-5" />,
    duration: 6000,
  });
};

/**
 * Warning toast with alert icon
 */
export const showWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    icon: <AlertCircle className="h-5 w-5" />,
    duration: 5000,
  });
};

/**
 * Info toast with info icon
 */
export const showInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    icon: <Info className="h-5 w-5" />,
    duration: 4000,
  });
};

/**
 * Loading toast - returns toast ID for dismissal
 */
export const showLoading = (message: string, description?: string) => {
  return toast.loading(message, {
    description,
    icon: <Loader2 className="h-5 w-5 animate-spin" />,
  });
};

/**
 * Promise toast - automatically handles loading/success/error states
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  }
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
};

/**
 * Dismiss a specific toast by ID
 */
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

// ============================================================================
// DOMAIN-SPECIFIC TOASTS
// ============================================================================

export const advisorToasts = {
  created: (name: string) => showSuccess('Advisor Created', `${name} has been added to the team`),
  updated: (name: string) => showSuccess('Advisor Updated', `Changes to ${name} have been saved`),
  deleted: (name: string) => showSuccess('Advisor Removed', `${name} has been removed from the team`),
  skillsUpdated: (name: string) => showSuccess('Skills Updated', `${name}'s skills have been updated`),
  capacityUpdated: (name: string) => showSuccess('Capacity Updated', `${name}'s capacity has been adjusted`),
  error: (action: string) => showError('Advisor Error', `Failed to ${action}. Please try again.`),
};

export const clientToasts = {
  created: (name: string) => showSuccess('Client Created', `${name} has been added`),
  updated: (name: string) => showSuccess('Client Updated', `Changes to ${name} have been saved`),
  deleted: (name: string) => showSuccess('Client Removed', `${name} has been removed`),
  needsUpdated: (name: string) => showSuccess('Needs Updated', `Planning needs for ${name} have been updated`),
  converted: (name: string) => showSuccess('Prospect Converted', `${name} is now an active client`),
  error: (action: string) => showError('Client Error', `Failed to ${action}. Please try again.`),
};

export const matchToasts = {
  running: () => {
    return showLoading('Running Match', 'Analyzing advisors and calculating scores...');
  },
  completed: (count: number) => showSuccess('Match Complete', `Found ${count} potential advisor matches`),
  assigned: (advisorName: string, clientName: string) => 
    showSuccess('Assignment Created', `${advisorName} assigned to ${clientName}`),
  error: () => showError('Match Error', 'Failed to calculate matches. Please try again.'),
};

export const assignmentToasts = {
  created: () => showSuccess('Assignment Created', 'Advisor has been assigned to client'),
  updated: () => showSuccess('Assignment Updated', 'Assignment details have been updated'),
  deleted: () => showSuccess('Assignment Removed', 'Assignment has been removed'),
  error: (action: string) => showError('Assignment Error', `Failed to ${action}. Please try again.`),
};

export const taxonomyToasts = {
  domainCreated: (name: string) => showSuccess('Domain Created', `${name} domain has been added`),
  subtopicCreated: (name: string) => showSuccess('Subtopic Created', `${name} subtopic has been added`),
  updated: (name: string) => showSuccess('Taxonomy Updated', `${name} has been updated`),
  deleted: (name: string) => showSuccess('Taxonomy Deleted', `${name} has been removed`),
  error: (action: string) => showError('Taxonomy Error', `Failed to ${action}. Please try again.`),
};

// ============================================================================
// VALIDATION TOASTS
// ============================================================================

export const validationToasts = {
  requiredFields: () => showWarning('Required Fields', 'Please fill in all required fields'),
  invalidEmail: () => showWarning('Invalid Email', 'Please enter a valid email address'),
  invalidNumber: (field: string) => showWarning('Invalid Number', `${field} must be a valid number`),
  minValue: (field: string, min: number) => 
    showWarning('Value Too Low', `${field} must be at least ${min}`),
  maxValue: (field: string, max: number) => 
    showWarning('Value Too High', `${field} must be no more than ${max}`),
  duplicateValue: (field: string) => 
    showWarning('Duplicate Value', `This ${field} already exists`),
};

// ============================================================================
// OPERATION TOASTS
// ============================================================================

export const operationToasts = {
  saving: () => showLoading('Saving', 'Please wait while we save your changes...'),
  saved: () => showSuccess('Saved', 'Your changes have been saved successfully'),
  deleting: () => showLoading('Deleting', 'Please wait while we delete this item...'),
  deleted: () => showSuccess('Deleted', 'Item has been deleted successfully'),
  uploading: () => showLoading('Uploading', 'Please wait while we upload your file...'),
  uploaded: () => showSuccess('Uploaded', 'File has been uploaded successfully'),
  exporting: () => showLoading('Exporting', 'Preparing your export...'),
  exported: () => showSuccess('Exported', 'Export completed successfully'),
  copying: () => showInfo('Copied', 'Copied to clipboard'),
};

// ============================================================================
// PERMISSION TOASTS
// ============================================================================

export const permissionToasts = {
  denied: (action: string) => showError('Permission Denied', `You don't have permission to ${action}`),
  unauthorized: () => showError('Unauthorized', 'Please log in to continue'),
  sessionExpired: () => showWarning('Session Expired', 'Please log in again'),
};

// ============================================================================
// NETWORK TOASTS
// ============================================================================

export const networkToasts = {
  offline: () => showWarning('Offline', 'You appear to be offline. Changes will sync when reconnected.'),
  online: () => showInfo('Back Online', 'Connection restored'),
  error: () => showError('Network Error', 'Failed to connect. Please check your connection.'),
  timeout: () => showError('Request Timeout', 'The request took too long. Please try again.'),
};

// ============================================================================
// CUSTOM ACTION TOASTS
// ============================================================================

export const actionToasts = {
  undo: (message: string, onUndo: () => void) => {
    toast.success(message, {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: onUndo,
      },
    });
  },
  
  confirm: (message: string, description: string, onConfirm: () => void) => {
    toast.info(message, {
      description,
      duration: 10000,
      action: {
        label: 'Confirm',
        onClick: onConfirm,
      },
    });
  },
};

// ============================================================================
// BATCH OPERATION TOASTS
// ============================================================================

export const batchToasts = {
  processing: (current: number, total: number) => {
    return showLoading(
      'Processing',
      `Processing ${current} of ${total} items...`
    );
  },
  
  completed: (successful: number, failed: number, total: number) => {
    if (failed === 0) {
      showSuccess(
        'Batch Complete',
        `Successfully processed all ${total} items`
      );
    } else {
      showWarning(
        'Batch Complete with Errors',
        `${successful} succeeded, ${failed} failed out of ${total} items`
      );
    }
  },
};

// ============================================================================
// SKILL ASSESSMENT TOASTS
// ============================================================================

export const assessmentToasts = {
  started: (advisorName: string) => 
    showInfo('Assessment Started', `Beginning skill assessment for ${advisorName}`),
  saved: (count: number) => 
    showSuccess('Assessment Saved', `${count} skill ratings have been saved`),
  reminded: (advisorName: string) => 
    showInfo('Reminder Sent', `Assessment reminder sent to ${advisorName}`),
};
