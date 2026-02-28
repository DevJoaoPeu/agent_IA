import { financeAgent } from "./subagents/finance";
import { medicalSpecialtiesAgent } from "./subagents/medicalSpecialties";
import { ClinicOrchestratorResult, ClinicSubAgent } from "./interface/types";

const subAgents: ClinicSubAgent[] = [financeAgent, medicalSpecialtiesAgent];

const triageResult = (reason: string): ClinicOrchestratorResult => ({
  selectedAgent: "triagem",
  confidence: 0,
  reason,
  response:
    "Consigo te ajudar com financeiro ou com medicos/especialidades. Me diga qual assunto voce precisa agora.",
  nextStep: "Fazer pergunta de desambiguacao para direcionar o atendimento.",
  metadata: {
    options: ["financeiro", "medicos_especialidades"]
  }
});

export const orchestrateClinicMessage = (message: string): ClinicOrchestratorResult => {
  const normalizedMessage = message.trim();

  const scoredAgents = subAgents
    .map((agent) => ({
      agent,
      score: agent.canHandle(normalizedMessage)
    }))
    .sort((left, right) => right.score - left.score);

  const bestCandidate = scoredAgents[0];
  const secondCandidate = scoredAgents[1];

  if (!bestCandidate || bestCandidate.score === 0) {
    return triageResult("Nenhuma intencao clara para os subagentes atuais.");
  }

  if (secondCandidate && secondCandidate.score > 0 && bestCandidate.score - secondCandidate.score <= 1) {
    return triageResult("Mensagem com intencoes concorrentes.");
  }

  const response = bestCandidate.agent.handle(normalizedMessage);
  const totalScore = scoredAgents.reduce((accumulator, item) => accumulator + item.score, 0);
  const confidence = totalScore > 0 ? Number((bestCandidate.score / totalScore).toFixed(2)) : 0;

  return {
    selectedAgent: response.agent,
    confidence,
    reason: `Roteado para ${response.agent} com score ${bestCandidate.score}.`,
    response: response.response,
    nextStep: response.nextStep,
    metadata: response.metadata
  };
};
