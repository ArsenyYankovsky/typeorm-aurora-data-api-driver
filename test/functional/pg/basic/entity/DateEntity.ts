import { Column, Entity, Generated, PrimaryColumn } from 'typeorm'

@Entity('date_entity')
export class DateEntity {
  @PrimaryColumn()
  @Generated()
  public id!: number

  // -------------------------------------------------------------------------
  // Date/Time Types
  // -------------------------------------------------------------------------

  @Column('date')
  date!: string

  @Column('interval')
  interval: any

  @Column('time')
  time!: string

  @Column('time with time zone')
  timeWithTimeZone!: string

  @Column('timetz')
  timetz!: string

  @Column('timestamp')
  timestamp!: Date

  @Column('timestamp with time zone')
  timestampWithTimeZone!: Date

  @Column('timestamptz')
  timestamptz!: Date
}
