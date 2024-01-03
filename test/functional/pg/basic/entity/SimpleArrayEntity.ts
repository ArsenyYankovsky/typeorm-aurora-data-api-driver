import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class SimpleArrayEntity {
  @PrimaryGeneratedColumn()
    id!: number

  // -------------------------------------------------------------------------
  // Simple Array Type
  // -------------------------------------------------------------------------

  @Column('simple-array', { nullable: true })
    array!: string[] | null
}
