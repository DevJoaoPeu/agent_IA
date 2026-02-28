export type ClinicSubAgentName = "financeiro" | "medicos_especialidades";
export type ClinicAgentName = ClinicSubAgentName | "triagem";

export interface ClinicAgentResponse {
  agent: ClinicSubAgentName;
  response: string;
  nextStep: string;
  metadata?: Record<string, unknown>;
}

export interface ClinicOrchestratorResult {
  selectedAgent: ClinicAgentName;
  confidence: number;
  reason: string;
  response: string;
  nextStep: string;
  metadata?: Record<string, unknown>;
}

export interface ClinicSubAgent {
  name: ClinicSubAgentName;
  canHandle(message: string): number;
  handle(message: string): Promise<ClinicAgentResponse>;
}
