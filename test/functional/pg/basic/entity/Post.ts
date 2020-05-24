import { Column, Entity, Generated, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm'
import { Category } from './Category'

@Entity('post', { schema: 'test' })
export class Post {
  @PrimaryColumn()
  @Generated()
  public id!: number

  @Column()
  public title!: string

  @Column()
  public text!: string

  @Column({ nullable: false })
  public likesCount!: number

  @Column({ nullable: false, type: 'timestamp', default: () => 'now()' })
  public publishedAt!: Date

  @Column({ nullable: true, type: 'timestamp' })
  public updatedAt?: Date

  @ManyToMany(type => Category)
  @JoinTable()
  public categories!: Category[]
}
