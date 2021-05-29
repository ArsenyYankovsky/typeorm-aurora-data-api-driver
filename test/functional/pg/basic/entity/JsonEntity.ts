import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class JsonEntity {
  @PrimaryGeneratedColumn()
  id!: number


  // -------------------------------------------------------------------------
  // JSON Type
  // -------------------------------------------------------------------------

  @Column('json', { nullable: true })
  json!: Object | null

  @Column('jsonb')
  jsonb!: Object
}
