import postgres from "../db/postgres";
import { DoctorEntity } from "../entities/doctor.entity";

export class DoctorRepository {
    async findByName(name: string): Promise<DoctorEntity[]> {
        return postgres
            .getRepository(DoctorEntity)
            .createQueryBuilder("doctor")
            .leftJoinAndSelect(
                "doctor.specialties",
                "specialty",
                "specialty.is_active = :specialtyIsActive",
                { specialtyIsActive: true }
            )
            .where("doctor.is_active = :isActive", { isActive: true })
            .andWhere("doctor.name ILIKE :name", { name: `%${name}%` })
            .orderBy("doctor.name", "ASC")
            .getMany();
    }

    async findBySpecialty(specialty: number): Promise<DoctorEntity[]> {
        return postgres
            .getRepository(DoctorEntity)
            .createQueryBuilder("doctor")
            .innerJoinAndSelect(
                "doctor.specialties",
                "specialty",
                "specialty.is_active = :specialtyIsActive",
                { specialtyIsActive: true }
            )
            .where("doctor.is_active = :isActive", { isActive: true })
            .andWhere("specialty.id = :specialtyId", { specialtyId: specialty })
            .orderBy("doctor.name", "ASC")
            .getMany();
    }

    async findByAllDoctors(): Promise<DoctorEntity[]> {
        return postgres.getRepository(DoctorEntity)
            .createQueryBuilder("doctor")
            .leftJoinAndSelect(
                "doctor.specialties",
                "specialty",
                "specialty.is_active = :specialtyIsActive",
                { specialtyIsActive: true }
            )
            .where("doctor.is_active = :isActive", { isActive: true })
            .orderBy("doctor.name", "ASC")
            .getMany();
    }
}

export const doctorRepository = new DoctorRepository();
