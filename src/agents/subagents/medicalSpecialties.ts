import { includesAny, normalizeText } from "../text";
import { ClinicSubAgent } from "../types";

interface DoctorProfile {
  name: string;
  specialty: string;
  shifts: string[];
  aliases: string[];
}

const doctorDirectory: DoctorProfile[] = [
  {
    name: "Dra. Ana Silva",
    specialty: "Cardiologia",
    shifts: ["segunda (manha)", "quarta (tarde)"],
    aliases: ["ana silva", "dra ana", "doutora ana"]
  },
  {
    name: "Dr. Bruno Souza",
    specialty: "Ortopedia",
    shifts: ["terca (tarde)", "quinta (manha)"],
    aliases: ["bruno souza", "dr bruno", "doutor bruno"]
  },
  {
    name: "Dra. Carla Mendes",
    specialty: "Dermatologia",
    shifts: ["segunda (tarde)", "sexta (manha)"],
    aliases: ["carla mendes", "dra carla", "doutora carla"]
  },
  {
    name: "Dr. Diego Lima",
    specialty: "Clinica Geral",
    shifts: ["segunda a sexta (manha)"],
    aliases: ["diego lima", "dr diego", "doutor diego"]
  }
];

const MEDICAL_KEYWORDS = [
  "medico",
  "medica",
  "especialidade",
  "especialista",
  "consulta",
  "agendamento",
  "cardio",
  "ortopedia",
  "dermato",
  "clinico geral"
] as const;

const specialtyAliases: Array<{ keyword: string; specialty: string }> = [
  { keyword: "cardiologista", specialty: "Cardiologia" },
  { keyword: "cardiologia", specialty: "Cardiologia" },
  { keyword: "cardio", specialty: "Cardiologia" },
  { keyword: "ortopedista", specialty: "Ortopedia" },
  { keyword: "ortopedia", specialty: "Ortopedia" },
  { keyword: "dermatologista", specialty: "Dermatologia" },
  { keyword: "dermatologia", specialty: "Dermatologia" },
  { keyword: "dermato", specialty: "Dermatologia" },
  { keyword: "clinico geral", specialty: "Clinica Geral" },
  { keyword: "clinica geral", specialty: "Clinica Geral" },
  { keyword: "generalista", specialty: "Clinica Geral" }
];

const uniqueSpecialties = Array.from(new Set(doctorDirectory.map((doctor) => doctor.specialty)));

const findSpecialty = (normalizedMessage: string): string | null => {
  for (const alias of specialtyAliases) {
    if (normalizedMessage.includes(alias.keyword)) {
      return alias.specialty;
    }
  }

  return null;
};

const findDoctor = (normalizedMessage: string): DoctorProfile | null => {
  for (const doctor of doctorDirectory) {
    if (doctor.aliases.some((alias) => normalizedMessage.includes(alias))) {
      return doctor;
    }
  }

  return null;
};

export const medicalSpecialtiesAgent: ClinicSubAgent = {
  name: "medicos_especialidades",
  canHandle(message: string): number {
    const normalizedMessage = normalizeText(message);
    let score = 0;

    if (includesAny(normalizedMessage, MEDICAL_KEYWORDS)) {
      score += 3;
    }

    if (findSpecialty(normalizedMessage)) {
      score += 2;
    }

    if (findDoctor(normalizedMessage)) {
      score += 2;
    }

    return score;
  },
  handle(message: string) {
    const normalizedMessage = normalizeText(message);
    const matchedDoctor = findDoctor(normalizedMessage);
    const matchedSpecialty = findSpecialty(normalizedMessage);
    const asksForSpecialties =
      normalizedMessage.includes("especialidade") || normalizedMessage.includes("especialidades");

    if (matchedDoctor) {
      return {
        agent: "medicos_especialidades",
        response: `${matchedDoctor.name} atende em ${matchedDoctor.specialty} nos periodos: ${matchedDoctor.shifts.join(", ")}.`,
        nextStep: "Perguntar preferencia de dia/periodo para seguir com o agendamento.",
        metadata: {
          doctor: matchedDoctor
        }
      };
    }

    if (matchedSpecialty) {
      const doctorsBySpecialty = doctorDirectory.filter((doctor) => doctor.specialty === matchedSpecialty);
      return {
        agent: "medicos_especialidades",
        response: `Temos ${matchedSpecialty} com: ${doctorsBySpecialty.map((doctor) => doctor.name).join(", ")}.`,
        nextStep: "Perguntar qual medico ou periodo o paciente prefere.",
        metadata: {
          specialty: matchedSpecialty,
          doctors: doctorsBySpecialty
        }
      };
    }

    if (asksForSpecialties) {
      return {
        agent: "medicos_especialidades",
        response: `Especialidades disponiveis: ${uniqueSpecialties.join(", ")}.`,
        nextStep: "Identificar a especialidade desejada para filtrar os medicos.",
        metadata: {
          specialties: uniqueSpecialties
        }
      };
    }

    return {
      agent: "medicos_especialidades",
      response:
        "Posso ajudar com informacoes de medicos e especialidades. Me diga o nome do medico ou a especialidade desejada.",
      nextStep: "Coletar especialidade ou nome do medico para sugerir opcoes.",
      metadata: {
        specialties: uniqueSpecialties
      }
    };
  }
};
