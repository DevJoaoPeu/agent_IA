import { includesAny, normalizeText } from "../utils/text";
import { ClinicSubAgent } from "../interface/types";

const FINANCE_KEYWORDS = [
  "financeiro",
  "pagamento",
  "pagar",
  "boleto",
  "fatura",
  "nota fiscal",
  "reembolso",
  "orcamento",
  "parcelar",
  "parcela",
  "valor",
  "preco"
] as const;

const INVOICE_KEYWORDS = [
  "boleto",
  "fatura",
  "segunda via",
  "2 via",
  "vencimento"
] as const;

const NEGOTIATION_KEYWORDS = [
  "parcelar",
  "parcela",
  "desconto",
  "negociar",
  "atraso",
  "divida"
] as const;

export const financeAgent: ClinicSubAgent = {
  name: "financeiro",
  canHandle(message: string): number {
    const normalizedMessage = normalizeText(message);
    let score = 0;

    if (includesAny(normalizedMessage, FINANCE_KEYWORDS)) {
      score += 3;
    }

    if (includesAny(normalizedMessage, INVOICE_KEYWORDS)) {
      score += 2;
    }

    if (includesAny(normalizedMessage, NEGOTIATION_KEYWORDS)) {
      score += 2;
    }

    return score;
  },
  async handle(message: string) {
    const normalizedMessage = normalizeText(message);

    if (includesAny(normalizedMessage, INVOICE_KEYWORDS)) {
      return {
        agent: "financeiro",
        response:
          "Posso te ajudar com a 2a via de boleto/fatura. Vou precisar do CPF do paciente e da competencia (mes/ano).",
        nextStep: "Solicitar CPF e competencia para localizar o titulo financeiro.",
        metadata: {
          topic: "segunda_via",
          requiredData: ["cpf", "competencia"]
        }
      };
    }

    if (includesAny(normalizedMessage, NEGOTIATION_KEYWORDS)) {
      return {
        agent: "financeiro",
        response:
          "Consigo direcionar para negociacao financeira. Informe o CPF e os titulos em aberto para avaliar parcelamento.",
        nextStep: "Coletar CPF e listar os titulos pendentes para simulacao.",
        metadata: {
          topic: "negociacao",
          requiredData: ["cpf", "titulos_pendentes"]
        }
      };
    }

    return {
      agent: "financeiro",
      response:
        "Entendi uma demanda financeira. Posso ajudar com valores, cobranca, boleto e reembolso.",
      nextStep: "Confirmar se a demanda e boleto, valor de consulta, reembolso ou parcelamento.",
      metadata: {
        topic: "geral_financeiro"
      }
    };
  }
};
