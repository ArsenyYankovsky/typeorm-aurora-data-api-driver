import {
  Column,
  Entity,
  Generated,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
} from 'typeorm'
import { Category } from './Category'

@Entity('uuid_post')
export class UuidPost {
  @Generated('uuid')
  @PrimaryColumn('uuid')
  public id!: string

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

  @ManyToMany(() => Category)
  @JoinTable()
  public categories!: Category[]
}
