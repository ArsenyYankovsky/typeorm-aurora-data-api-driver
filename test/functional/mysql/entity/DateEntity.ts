import { Column, Entity, Generated, PrimaryColumn } from 'typeorm'

@Entity('date_entity')
export class DateEntity {
  @PrimaryColumn()
  @Generated()
  public id!: number

  // -------------------------------------------------------------------------
  // Date Types
  // -------------------------------------------------------------------------

  @Column('date')
    date!: string

  @Column('datetime')
    datetime!: Date

  @Column('timestamp')
    timestamp!: Date

  @Column('time')
    time!: string

  @Column('year')
    year!: number
}
