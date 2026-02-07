import { z } from 'zod';
import type { SegmentType, ComplexityTier, HorizonType } from '@/types/database';

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

export const emailSchema = z.string().email('Invalid email address');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
  .optional()
  .or(z.literal(''));

export const urlSchema = z.string().url('Invalid URL').optional().or(z.literal(''));

export const positiveNumberSchema = z.number().positive('Must be a positive number');

export const percentageSchema = z
  .number()
  .min(0, 'Must be at least 0%')
  .max(100, 'Must be at most 100%');

export const ratingSchema = z
  .number()
  .min(1, 'Rating must be at least 1')
  .max(10, 'Rating must be at most 10');

// ============================================================================
// ADVISOR VALIDATION
// ============================================================================

export const advisorProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  office: z.string().min(1, 'Office is required'),
  team: z.string().optional(),
});

export const advisorCapacitySchema = z.object({
  max_families: positiveNumberSchema,
  current_families: z.number().min(0, 'Cannot be negative'),
  target_segment: z.enum(['essentials', 'traditional', 'private_client', 'ultra_hnw']),
  availability_status: z.enum(['available', 'limited', 'at_capacity', 'unavailable']),
});

export const advisorSkillSchema = z.object({
  subtopic_id: z.string().uuid('Invalid subtopic'),
  skill_level: ratingSchema,
  case_count: z.number().min(0, 'Case count cannot be negative'),
  evidence: z.string().optional(),
  notes: z.string().optional(),
});

export const advisorFormSchema = z
  .object({
    ...advisorProfileSchema.shape,
    ...advisorCapacitySchema.shape,
    years_experience: z.number().min(0, 'Years of experience cannot be negative'),
    certifications: z.array(z.string()).default([]),
    interest_areas: z.array(z.string()).default([]),
    growth_goals: z.array(z.string()).default([]),
  })
  .refine(
    (data) => data.current_families <= data.max_families,
    {
      message: 'Current families cannot exceed maximum capacity',
      path: ['current_families'],
    }
  );

// ============================================================================
// CLIENT VALIDATION
// ============================================================================

export const clientBasicInfoSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  segment: z.enum(['essentials', 'traditional', 'private_client', 'ultra_hnw'] as const),
  complexity_tier: z.enum(['standard', 'complex', 'highly_complex'] as const),
  office: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const clientFinancialInfoSchema = z.object({
  aum_band: z.string().optional(),
  net_worth_band: z.string().optional(),
  valeo_client_since: z.string().optional(),
  my_client_since: z.string().optional(),
});

export const clientFormSchema = z.object({
  ...clientBasicInfoSchema.shape,
  ...clientFinancialInfoSchema.shape,
  notes: z.string().optional(),
  is_prospect: z.boolean().default(true),
});

export const clientNeedSchema = z.object({
  subtopic_id: z.string().uuid('Invalid subtopic'),
  importance: ratingSchema,
  urgency: ratingSchema,
  horizon: z.enum(['now', '1yr', '3yr', '5yr'] as const),
  notes: z.string().optional(),
});

export const clientWithNeedsSchema = z.object({
  ...clientFormSchema.shape,
  needs: z.array(clientNeedSchema).min(1, 'At least one planning need is required'),
});

// ============================================================================
// ASSIGNMENT VALIDATION
// ============================================================================

export const assignmentSchema = z
  .object({
    client_id: z.string().uuid('Invalid client'),
    lead_advisor_id: z.string().uuid('Invalid advisor').optional(),
    backup_advisor_id: z.string().uuid('Invalid advisor').optional(),
    support_advisor_id: z.string().uuid('Invalid advisor').optional(),
    notes: z.string().optional(),
    override_reason: z.string().optional(),
  })
  .refine(
    (data) => {
      // At least one advisor must be assigned
      return data.lead_advisor_id || data.backup_advisor_id || data.support_advisor_id;
    },
    {
      message: 'At least one advisor must be assigned',
      path: ['lead_advisor_id'],
    }
  )
  .refine(
    (data) => {
      // Lead, backup, and support must be different advisors
      const advisors = [
        data.lead_advisor_id,
        data.backup_advisor_id,
        data.support_advisor_id,
      ].filter(Boolean);
      return new Set(advisors).size === advisors.length;
    },
    {
      message: 'Lead, backup, and support advisors must be different',
      path: ['backup_advisor_id'],
    }
  );

// ============================================================================
// TAXONOMY VALIDATION
// ============================================================================

export const domainSchema = z.object({
  name: z.string().min(2, 'Domain name must be at least 2 characters'),
  description: z.string().optional(),
  display_order: z.number().min(0, 'Display order must be non-negative'),
  is_active: z.boolean().default(true),
});

export const subtopicSchema = z.object({
  domain_id: z.string().uuid('Invalid domain'),
  name: z.string().min(2, 'Subtopic name must be at least 2 characters'),
  description: z.string().optional(),
  default_weight: z.number().min(0).max(10, 'Weight must be between 0 and 10'),
  display_order: z.number().min(0, 'Display order must be non-negative'),
  is_active: z.boolean().default(true),
});

// ============================================================================
// PROSPECT INTAKE VALIDATION (Multi-step)
// ============================================================================

export const prospectStep1Schema = z.object({
  name: z.string().min(2, 'Client name is required'),
  segment: z.string().min(1, 'Segment is required'),
  complexity: z.string().min(1, 'Complexity tier is required'),
  aum: z.string().optional(),
  netWorth: z.string().optional(),
  office: z.string().optional(),
});

export const prospectStep2Schema = z.object({
  needs: z
    .record(z.string(), z.object({
      importance: ratingSchema,
      urgency: ratingSchema,
      horizon: z.enum(['now', '1yr', '3yr', '5yr']),
    }))
    .refine(
      (needs) => Object.keys(needs).length > 0,
      'At least one planning need is required'
    ),
});

export const prospectStep3Schema = z.object({
  notes: z.string().optional(),
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate data against a schema and return typed result
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

/**
 * Get user-friendly error messages from Zod errors
 */
export function getErrorMessages(error: z.ZodError): Record<string, string> {
  const messages: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    messages[path] = err.message;
  });
  
  return messages;
}

/**
 * Get first error message for a field
 */
export function getFieldError(error: z.ZodError | undefined, field: string): string | undefined {
  if (!error) return undefined;
  
  const fieldError = error.errors.find((err) => err.path.join('.') === field);
  return fieldError?.message;
}

/**
 * Check if a field has an error
 */
export function hasFieldError(error: z.ZodError | undefined, field: string): boolean {
  if (!error) return false;
  
  return error.errors.some((err) => err.path.join('.') === field);
}

// ============================================================================
// CUSTOM VALIDATORS
// ============================================================================

/**
 * Validate that a date is not in the future
 */
export const pastDateSchema = z.string().refine(
  (date) => {
    if (!date) return true;
    return new Date(date) <= new Date();
  },
  { message: 'Date cannot be in the future' }
);

/**
 * Validate that a date is not in the past
 */
export const futureDateSchema = z.string().refine(
  (date) => {
    if (!date) return true;
    return new Date(date) >= new Date();
  },
  { message: 'Date cannot be in the past' }
);

/**
 * Validate that end date is after start date
 */
export const dateRangeSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
}).refine(
  (data) => {
    if (!data.start_date || !data.end_date) return true;
    return new Date(data.end_date) >= new Date(data.start_date);
  },
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

/**
 * Validate file upload
 */
export function createFileSchema(options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}) {
  return z.instanceof(File).refine(
    (file) => {
      if (options.maxSize) {
        return file.size <= options.maxSize;
      }
      return true;
    },
    {
      message: `File size must be less than ${options.maxSize ? options.maxSize / 1024 / 1024 : ''}MB`,
    }
  ).refine(
    (file) => {
      if (options.allowedTypes) {
        return options.allowedTypes.includes(file.type);
      }
      return true;
    },
    {
      message: `File type must be one of: ${options.allowedTypes?.join(', ')}`,
    }
  );
}

// ============================================================================
// FIELD-LEVEL VALIDATORS (for real-time validation)
// ============================================================================

export const fieldValidators = {
  email: (value: string) => {
    const result = emailSchema.safeParse(value);
    return result.success ? null : result.error.errors[0].message;
  },
  
  phone: (value: string) => {
    if (!value) return null;
    const result = phoneSchema.safeParse(value);
    return result.success ? null : result.error.errors[0].message;
  },
  
  rating: (value: number) => {
    const result = ratingSchema.safeParse(value);
    return result.success ? null : result.error.errors[0].message;
  },
  
  percentage: (value: number) => {
    const result = percentageSchema.safeParse(value);
    return result.success ? null : result.error.errors[0].message;
  },
  
  required: (value: any, fieldName = 'This field') => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  },
  
  minLength: (value: string, min: number, fieldName = 'This field') => {
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },
  
  maxLength: (value: string, max: number, fieldName = 'This field') => {
    if (value.length > max) {
      return `${fieldName} must be at most ${max} characters`;
    }
    return null;
  },
};

// Export type helpers
export type AdvisorFormData = z.infer<typeof advisorFormSchema>;
export type ClientFormData = z.infer<typeof clientFormSchema>;
export type ClientWithNeedsData = z.infer<typeof clientWithNeedsSchema>;
export type AssignmentFormData = z.infer<typeof assignmentSchema>;
export type DomainFormData = z.infer<typeof domainSchema>;
export type SubtopicFormData = z.infer<typeof subtopicSchema>;
