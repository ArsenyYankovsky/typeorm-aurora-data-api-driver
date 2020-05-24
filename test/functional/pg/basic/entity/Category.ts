import { Column, Entity, Generated, PrimaryColumn } from 'typeorm'

@Entity('category', { schema: 'test' })
export class Category {
  @PrimaryColumn()
  @Generated()
  public id!: number

  @Column()
  public name!: string
}
