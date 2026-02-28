import { includesAny, normalizeDoctorName, normalizeText } from "../utils/text";
import { ClinicSubAgent } from "../interface/types";
import { doctorRepository } from "../../repositorios/doctor.repositoriy";

interface DoctorProfile {
  id: string;
  name: string;
  specialties: string[];
  normalizedName: string;
  firstName: string;
}

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

const DOCTOR_CUES = ["dr", "dra", "doutor", "doutora"] as const;

const specialtyAliases: Array<{ keyword: string; specialty: string }> = [
  { keyword: "cardiologista", specialty: "cardiologia" },
  { keyword: "cardiologia", specialty: "cardiologia" },
  { keyword: "cardio", specialty: "cardiologia" },
  { keyword: "ortopedista", specialty: "ortopedia" },
  { keyword: "ortopedia", specialty: "ortopedia" },
  { keyword: "dermatologista", specialty: "dermatologia" },
  { keyword: "dermatologia", specialty: "dermatologia" },
  { keyword: "dermato", specialty: "dermatologia" },
  { keyword: "clinico geral", specialty: "clinica geral" },
  { keyword: "clinica geral", specialty: "clinica geral" },
  { keyword: "generalista", specialty: "clinica geral" }
];

const buildDoctorProfiles = async (): Promise<DoctorProfile[]> => {
  const doctors = await doctorRepository.findByAllDoctors();

  return doctors.map((doctor) => {
    const normalizedName = normalizeDoctorName(doctor.name);
    const firstName = normalizedName.split(" ").filter(Boolean)[0] ?? "";
    const specialties = (doctor.specialties ?? []).map((specialty) => specialty.name);

    return {
      id: doctor.id,
      name: doctor.name,
      specialties,
      normalizedName,
      firstName
    };
  });
};

const getUniqueSpecialties = (doctors: DoctorProfile[]): string[] =>
  Array.from(new Set(doctors.flatMap((doctor) => doctor.specialties)))
    .sort((left, right) => left.localeCompare(right, "pt-BR"));

const findSpecialty = (normalizedMessage: string, specialties: string[]): string | null => {
  for (const specialty of specialties) {
    if (normalizedMessage.includes(normalizeText(specialty))) {
      return specialty;
    }
  }

  for (const alias of specialtyAliases) {
    if (normalizedMessage.includes(alias.keyword)) {
      const matchedSpecialty = specialties.find(
        (specialty) => normalizeText(specialty) === alias.specialty
      );

      if (matchedSpecialty) {
        return matchedSpecialty;
      }
    }
  }

  return null;
};

const findDoctor = (normalizedMessage: string, doctors: DoctorProfile[]): DoctorProfile | null => {
  const hasDoctorCue = includesAny(normalizedMessage, DOCTOR_CUES);

  for (const doctor of doctors) {
    if (normalizedMessage.includes(doctor.normalizedName)) {
      return doctor;
    }

    if (hasDoctorCue && doctor.firstName && normalizedMessage.includes(doctor.firstName)) {
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

    if (includesAny(normalizedMessage, specialtyAliases.map((alias) => alias.keyword))) {
      score += 2;
    }

    if (includesAny(normalizedMessage, DOCTOR_CUES)) {
      score += 1;
    }

    return score;
  },
  async handle(message: string) {
    const normalizedMessage = normalizeText(message);
    const asksForSpecialties =
      normalizedMessage.includes("especialidade") || normalizedMessage.includes("especialidades");

    let doctorDirectory: DoctorProfile[] = [];

    try {
      doctorDirectory = await buildDoctorProfiles();
    } catch (error: unknown) {
      return {
        agent: "medicos_especialidades",
        response:
          "Nao consegui consultar os medicos no banco agora. Tente novamente em instantes.",
        nextStep: "Repetir consulta de medicos/especialidades quando a conexao com o banco estabilizar.",
        metadata: {
          error: String(error)
        }
      };
    }

    if (doctorDirectory.length === 0) {
      return {
        agent: "medicos_especialidades",
        response: "Nao encontrei medicos ativos cadastrados no momento.",
        nextStep: "Cadastrar medicos e vincular especialidades para habilitar as consultas.",
        metadata: {
          doctors: []
        }
      };
    }

    const uniqueSpecialties = getUniqueSpecialties(doctorDirectory);
    const matchedDoctor = findDoctor(normalizedMessage, doctorDirectory);
    const matchedSpecialty = findSpecialty(normalizedMessage, uniqueSpecialties);

    if (matchedDoctor) {
      const doctorSpecialties = matchedDoctor.specialties.length > 0
        ? matchedDoctor.specialties.join(", ")
        : "especialidades nao cadastradas";

      return {
        agent: "medicos_especialidades",
        response: `${matchedDoctor.name} atende em: ${doctorSpecialties}.`,
        nextStep: "Perguntar qual especialidade e periodo o paciente prefere para seguir no agendamento.",
        metadata: {
          doctor: {
            id: matchedDoctor.id,
            name: matchedDoctor.name,
            specialties: matchedDoctor.specialties
          }
        }
      };
    }

    if (matchedSpecialty) {
      const matchedSpecialtyNormalized = normalizeText(matchedSpecialty);
      const doctorsBySpecialty = doctorDirectory.filter((doctor) =>
        doctor.specialties.some((specialty) => normalizeText(specialty) === matchedSpecialtyNormalized)
      );

      if (doctorsBySpecialty.length === 0) {
        return {
          agent: "medicos_especialidades",
          response: `Nao encontrei medicos ativos para ${matchedSpecialty} no momento.`,
          nextStep: "Sugerir outra especialidade ou registrar interesse para retorno.",
          metadata: {
            specialty: matchedSpecialty,
            doctors: []
          }
        };
      }

      return {
        agent: "medicos_especialidades",
        response: `Temos ${matchedSpecialty} com: ${doctorsBySpecialty.map((doctor) => doctor.name).join(", ")}.`,
        nextStep: "Perguntar qual medico ou periodo o paciente prefere.",
        metadata: {
          specialty: matchedSpecialty,
          doctors: doctorsBySpecialty.map((doctor) => ({
            id: doctor.id,
            name: doctor.name
          }))
        }
      };
    }

    if (asksForSpecialties) {
      if (uniqueSpecialties.length === 0) {
        return {
          agent: "medicos_especialidades",
          response: "No momento nao ha especialidades ativas cadastradas.",
          nextStep: "Cadastrar especialidades e vincular aos medicos para disponibilizar essa consulta.",
          metadata: {
            specialties: []
          }
        };
      }

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
