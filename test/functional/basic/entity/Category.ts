import { Column, Entity, Generated, ManyToMany, PrimaryColumn } from 'typeorm'
import { Post } from './Post'

@Entity('aurora_data_api_test_category')
export class Category {
  @PrimaryColumn('uuid')
  @Generated()
  public id!: string

  @Column()
  public name!: string

  @ManyToMany(type => Post, post => post.categories)
  public posts!: Post[]
}
