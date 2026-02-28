import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { DoctorEntity } from "./doctor.entity";

@Entity("specialties")
export class SpecialtyEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @ManyToMany(() => DoctorEntity, (doctor) => doctor.specialties)
  doctors!: DoctorEntity[];
}
