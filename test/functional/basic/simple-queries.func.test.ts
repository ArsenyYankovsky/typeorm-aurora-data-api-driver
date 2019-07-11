import 'reflect-metadata'
import { createConnection } from 'typeorm'
import { Post } from './entity/Post'

describe('aurora data api > simple queries', () => {
  jest.setTimeout(10000)

  it('should do a simple select', async () => {
    const connection = await createConnection({
      type: 'aurora-data-api',
      database: process.env.database!,
      secretArn: process.env.secretArn!,
      resourceArn: process.env.resourceArn!,
      region: process.env.region!,
      logging: true,
    })

    const result = await connection.query('select 1')

    expect(result[0][1]).toBe(1)

    await connection.close()
  })

  it('should create a table and be able to query it', async () => {
    const connection = await createConnection({
      type: 'aurora-data-api',
      database: process.env.database!,
      secretArn: process.env.secretArn!,
      resourceArn: process.env.resourceArn!,
      region: process.env.region!,
      entities: [Post],
      synchronize: true,
      logging: true,
    })

    const postRepository = connection.getRepository(Post)

    const post = new Post()

    post.title = 'My First Post'
    post.text = 'Post Text'
    post.likesCount = 4

    const insertResult = await postRepository.save(post)

    const postId = insertResult.id

    const dbPost = await postRepository.findOne({ id: postId })

    expect(dbPost).toBeTruthy()

    expect(dbPost!.title).toBe('My First Post')
    expect(dbPost!.text).toBe('Post Text')
    expect(dbPost!.likesCount).toBe(4)

    await connection.query('DROP TABLE aurora_data_api_test_post;')

    await connection.close()
  })

  it('batch insert', async () => {
    const connection = await createConnection({
      type: 'aurora-data-api',
      database: process.env.database!,
      secretArn: process.env.secretArn!,
      resourceArn: process.env.resourceArn!,
      region: process.env.region!,
      entities: [Post],
      synchronize: true,
      logging: true,
    })

    const postRepository = connection.getRepository(Post)

    const post = new Post()

    post.title = 'My First Post'
    post.text = 'Post Text'
    post.likesCount = 4

    const secondPost = new Post()

    secondPost.title = 'My Second Post'
    secondPost.text = 'Post Text'
    secondPost.likesCount = 5

    await postRepository.save([post, secondPost])

    const dbPosts = await postRepository.find()

    expect(dbPosts).toBeTruthy()

    expect(dbPosts.length).toBe(2)

    for (const dbPost of dbPosts) {
      expect(typeof dbPost!.title).toBe('string')
      expect(typeof dbPost!.text).toBe('string')
      expect(typeof dbPost!.likesCount).toBe('number')
    }

    await connection.query('DROP TABLE aurora_data_api_test_post;')

    await connection.close()
  })
})
