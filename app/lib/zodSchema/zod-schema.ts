import { z } from 'zod';

export const scheduleInputSchema = z.object({
  id: z.string().regex(/^c[^\s-]{8,}$/i, { message: "Invalid CUID format." }),
  arrivalTimeValues: z.string().refine((val) => /^[0-9\s]*$/.test(val), {
    message: "Arrival Times must contain only numbers and spaces.",
  }),
  burstTimeValues: z.string().refine((val) => /^[0-9\s]*$/.test(val), {
    message: "Burst Times must contain only numbers and spaces.",
  }),
  priorityValues: z.string().optional().refine((val) => val === undefined || /^[0-9\s]*$/.test(val), {
    message: "Priority Times must contain only numbers and spaces.",
  }),
  timeSlice: z.string().optional().refine((val) => val === undefined || /^[0-9]+$/.test(val), {
    message: "Time Slice must be a number.",
  }),
});

export const CreateFormSchema = scheduleInputSchema.omit({ id: true });

export interface InputFormError {
  errors?: {
      arrivalTimeValues?: string[];
      burstTimeValues?: string[];
      priorityTimeValues?: string[];
      sliceTime?: string[];
  };
  message?: string | null;
}


export type ScheduleInputTypes = z.infer<typeof scheduleInputSchema>;