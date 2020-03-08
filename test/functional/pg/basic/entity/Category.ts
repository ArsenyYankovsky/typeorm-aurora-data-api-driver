import { Column, Entity, Generated, PrimaryColumn } from 'typeorm'

@Entity('category', { schema: 'test1' })
export class Category {
  @PrimaryColumn()
  @Generated()
  public id!: number

  @Column()
  public name!: string
}
