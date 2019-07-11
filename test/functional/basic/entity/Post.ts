import { Column, Entity } from 'D:\\Development\\Workspace\\typeorm\\build\\package'
import { PrimaryColumn } from 'D:\\Development\\Workspace\\typeorm\\build\\package'
import { Generated } from 'D:\\Development\\Workspace\\typeorm\\build\\package'

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
}
