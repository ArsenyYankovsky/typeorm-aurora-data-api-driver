import { Column, Entity, Generated, PrimaryColumn } from 'typeorm'

@Entity()
export class Category {
  @PrimaryColumn()
  @Generated('uuid')
  public id!: string

  @Column()
  public name!: string
}
