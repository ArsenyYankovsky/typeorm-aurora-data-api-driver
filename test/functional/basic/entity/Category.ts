import { Column, Entity, Generated, PrimaryColumn } from 'typeorm'
// import { Post } from './Post'

@Entity()
export class Category {
  @PrimaryColumn()
  @Generated('uuid')
  public id!: string

  @Column()
  // @Index({ unique: true })
  public name!: string

  /*
  @ManyToOne(type => Category, category => category.children, { nullable: true })
  public parent?: Category

  @RelationId((self: Category) => self.parent)
  public readonly parentId?: string

  @OneToMany(type => Category, category => category.parent)
  public children!: Category[]
  */
  /*
  @ManyToMany(type => Post, post => post.categories)
  public posts!: Post[]
  */
}
