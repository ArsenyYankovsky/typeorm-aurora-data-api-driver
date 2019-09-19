import 'reflect-metadata'
import { createConnection } from '../utils/create-connection'
import { dropAllTablesAndCloseConnection } from '../utils/drop-all-tables'
import { Category } from './entity/Category'
import { Post } from './entity/Post'

describe('aurora data api > simple queries', () => {
  jest.setTimeout(240000)

  it('should do a simple select', async () => {
    const connection = await createConnection()

    const logSpy = jest.spyOn(global.console, 'log')

    const result = await connection.query('select 1')

    expect(logSpy).toHaveBeenCalledWith('query: select 1')
    expect(logSpy).toBeCalledTimes(1)

    expect(result[0][1]).toBe(1)

    await connection.close()
  })

  it('should create a table and be able to query it', async () => {
    const connection = await createConnection({
      entities: [Post, Category],
      synchronize: true,
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

    await dropAllTablesAndCloseConnection(connection)
  })

  it('batch insert - with dates', async () => {
    const connection = await createConnection({
      entities: [Post, Category],
      synchronize: true,
    })

    const postRepository = connection.getRepository(Post)

    const post = new Post()

    post.title = 'My First Post'
    post.text = 'Post Text'
    post.likesCount = 4
    post.publishedAt = new Date()

    const secondPost = new Post()

    secondPost.title = 'My Second Post'
    secondPost.text = 'Post Text'
    secondPost.likesCount = 5
    secondPost.publishedAt = new Date()

    await postRepository.save([post, secondPost])

    const dbPosts = await postRepository.find()

    expect(dbPosts).toBeTruthy()

    expect(dbPosts.length).toBe(2)

    for (const dbPost of dbPosts) {
      expect(typeof dbPost!.title).toBe('string')
      expect(typeof dbPost!.text).toBe('string')
      expect(typeof dbPost!.likesCount).toBe('number')

      expect(dbPost!.publishedAt).toBeInstanceOf(Date)
    }

    await dropAllTablesAndCloseConnection(connection)
  })

  it('should be able to create and query a many-to-many relationship', async () => {
    const connection = await createConnection({
      entities: [Post, Category],
      synchronize: true,
      logging: true,
    })

    // Create categories
    const categoryRepository = connection.getRepository(Category)

    const firstCategory = await categoryRepository.save(
      categoryRepository.create({
        name: 'first',
      }),
    )

    const secondCategory = await categoryRepository.save(
      categoryRepository.create({
        name: 'second',
      }),
    )

    // Create a post and associate with created categories
    const postRepository = connection.getRepository(Post)

    const post = postRepository.create({
      title: 'Post with categories',
      text: 'Text',
      likesCount: 6,
      publishedAt: new Date(),
      categories: [firstCategory, secondCategory],
    })

    await postRepository.save(post)

    // Assert
    const dbPosts = await postRepository.find({ relations: ['categories'] })
    expect(dbPosts).toBeTruthy()
    expect(dbPosts.length).toBe(1)

    for (const dbPost of dbPosts) {
      expect(dbPost.categories).toBeTruthy()
      expect(dbPost.categories.length).toBe(2)
      expect(dbPost.categories[0].name).toBe('first')
      expect(dbPost.categories[1].name).toBe('second')
    }

    await connection.close()

    // Initially keep the data for querying
    // await dropAllTablesAndCloseConnection(connection)
  })
})
