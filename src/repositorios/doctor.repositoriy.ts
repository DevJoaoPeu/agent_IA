import postgres from "../db/postgres";
import { DoctorEntity } from "../entities/doctor.entity";

export class DoctorRepository {
    async findByName(name: string): Promise<DoctorEntity[]> {
        return postgres
            .getRepository(DoctorEntity)
            .createQueryBuilder("doctor")
            .where("doctor.is_active = :isActive", { isActive: true })
            .andWhere("doctor.name ILIKE :name", { name: `%${name}%` })
            .orderBy("doctor.name", "ASC")
            .getMany();
    }

    async findBySpecialty(specialty: number): Promise<DoctorEntity[]> {
        return postgres
            .getRepository(DoctorEntity)
            .createQueryBuilder("doctor")
            .innerJoin("doctor.specialties", "specialty")
            .where("doctor.is_active = :isActive", { isActive: true })
            .andWhere("specialty.id = :specialtyId", { specialtyId: specialty })
            .orderBy("doctor.name", "ASC")
            .getMany();
    }

    async findByAllDoctors(): Promise<DoctorEntity[]> {
        return postgres.getRepository(DoctorEntity).find({
            where: {
                isActive: true,
            },
            order: {
                name: "ASC",
            },
        });
    }
}

export const doctorRepository = new DoctorRepository();
