import { Column, Entity, Generated, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm'
import { Category } from './Category'

@Entity('aurora_data_api_test_post')
export class Post {
  @PrimaryColumn('integer')
  @Generated()
  public id!: number

  @Column()
  public title!: string

  @Column()
  public text!: string

  @Column({ nullable: false })
  public likesCount!: number

  @Column({ nullable: false, type: 'datetime', default: () => 'now()' })
  public publishedAt!: Date

  @ManyToMany(type => Category, category => category.posts)
  @JoinTable()
  public categories!: Category[]
}
