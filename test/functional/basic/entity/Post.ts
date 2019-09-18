import { Column, Entity } from 'typeorm'
import { PrimaryColumn } from 'typeorm'
import { Generated } from 'typeorm'

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

  @Column({ nullable: false, type: 'datetime' })
  public publishedAt!: Date
}
