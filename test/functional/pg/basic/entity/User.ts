import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export default class User {
  @PrimaryGeneratedColumn('uuid')
  @Index()
    id!: string

  @Column()
    name!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', update: false })
    createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt!: Date
}
