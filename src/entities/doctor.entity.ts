import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity("doctors")
export class DoctorEntity {
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
}
