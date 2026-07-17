export type StepStatus = 'root' | 'checking' | 'valid' | 'invalid' | 'unsupported' | 'inconclusive';
export type VerificationStatus = Exclude<StepStatus, 'root' | 'checking'>;

export interface ProofStep {
  id: string;
  order?: number;
  latex: string;
  canonical?: string;
  status?: StepStatus;
}

export interface Counterexample {
  variable: 'x';
  value: number;
  previousLeft: number;
  previousRight: number;
  nextLeft: number;
  nextRight: number;
}

export interface VerificationResult {
  status: VerificationStatus;
  rule?: 'expand-square' | 'equivalent-rearrangement' | 'balance-operation' | 'solution-substitution';
  summary: string;
  counterexample?: Counterexample;
  likelyMissingTerm?: string;
  verifiedRepairLatex?: string;
  limitations?: string[];
}

export interface VerificationProvider {
  verifyTransition(previous: ProofStep, next: ProofStep): Promise<VerificationResult>;
}

export type ExplainMode = 'hint' | 'explain' | 'repair';

export interface ExplanationResult {
  title: string;
  body: string;
  question?: string;
  repairLatex?: string;
}

export interface TeachingRequest {
  previousStep: string;
  nextStep: string;
  verification: VerificationResult;
  mode: ExplainMode;
}

export interface TeachingProvider {
  generate(request: TeachingRequest): Promise<ExplanationResult>;
}
