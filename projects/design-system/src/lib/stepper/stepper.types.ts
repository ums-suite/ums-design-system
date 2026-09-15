export interface StepperStep {
  readonly label: string;
  readonly description?: string;
}

export type StepStatus = 'complete' | 'current' | 'upcoming';
