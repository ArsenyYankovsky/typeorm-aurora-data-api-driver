import 'reflect-metadata'
import { useCleanDatabase } from '../utils/create-connection'
import { Category } from './entity/Category'
import { Post } from './entity/Post'

describe('aurora data api > simple queries', () => {
  jest.setTimeout(240000)

  it('should do a simple select', async () => {
    await useCleanDatabase({}, async (connection) => {
      const logSpy = jest.spyOn(global.console, 'log')

      const result = await connection.query('select 1')

      expect(logSpy).toHaveBeenCalledWith('query: select 1')
      expect(logSpy).toBeCalledTimes(1)

      expect(result[0][1]).toBe(1)
    })
  })

  it('should create a table and be able to query it', async () => {
    await useCleanDatabase({ entities: [Post, Category] }, async (connection) => {
      const postRepository = connection.getRepository(Post)

      const post = new Post()
      post.title = 'My First Post'
      post.text = 'Post Text'
      post.likesCount = 4

      const insertResult = await postRepository.save(post)

      const dbPost = await postRepository.findOne({ id: insertResult.id })
      expect(dbPost).toBeTruthy()

      expect(dbPost!.title).toBe('My First Post')
      expect(dbPost!.text).toBe('Post Text')
      expect(dbPost!.likesCount).toBe(4)
    })
  })

  it('should batch insert with dates', async () => {
    await useCleanDatabase({ entities: [Post, Category] }, async (connection) => {
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
    })
  })

  it('should be able to create and query a many-to-many relationship', async () => {
    await useCleanDatabase({ entities: [Post, Category] }, async (connection) => {
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

      const storedPost = await postRepository.save(post)

      // Assert
      const dbPost = await postRepository.findOne(
        storedPost.id, { relations: ['categories'] })

      expect(dbPost).toBeTruthy()
      expect(dbPost!.categories).toBeTruthy()
      expect(dbPost!.categories.length).toBe(2)
    })
  })

  it('should be able to update a date field by primary key', async () => {
    await useCleanDatabase({ entities: [Post, Category] }, async (connection) => {
      // Create a post and associate with created categories
      const postRepository = connection.getRepository(Post)

      const storedPost = await postRepository.save(
        postRepository.create({
          title: 'Post For Update',
          text: 'Text',
          likesCount: 6,
          publishedAt: new Date(),
        }),
      )

      // Retrieve the post and update the date
      const getPost = await postRepository.findOne(storedPost.id)
      expect(getPost).toBeTruthy()

      const updatedAt = new Date()
      getPost!.updatedAt = updatedAt
      await postRepository.save(getPost!)

      // Assert
      const dbPost = await postRepository.findOne(storedPost.id)
      expect(dbPost).toBeTruthy()
      expect(dbPost!.updatedAt).toEqual(updatedAt)
    })
  })

  it('should be able to correctly deal with parameter sets', async () => {
    await useCleanDatabase({ entities: [Category] }, async (connection) => {
      const categoryNames = ['one', 'two', 'three', 'four']
      const newCategories = categoryNames.map(name => ({ name }))

      await connection.createQueryBuilder()
        .insert()
        .into(Category)
        .values(newCategories)
        .orIgnore()
        .execute()

      // Query back the inserted categories
      const categoryRepository = connection.getRepository(Category)
      const categories = await categoryRepository.find()

      // Assert
      expect(categories.length).toBe(4)
      expect(categories[0].name = 'one')
      expect(categories[1].name = 'two')
      expect(categories[2].name = 'three')
      expect(categories[3].name = 'four')
    })
  })
})
