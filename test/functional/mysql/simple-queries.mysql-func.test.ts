// eslint-disable-next-line import/no-extraneous-dependencies
import 'reflect-metadata'
import { JsonEntity } from './entity/JsonEntity'
import { useCleanDatabase } from '../utils/create-connection'
import { Category } from './entity/Category'
import { DateEntity } from './entity/DateEntity'
import { Post } from './entity/Post'

describe('aurora data api > simple queries', () => {
  jest.setTimeout(240000)

  it('should do a simple select', async () => {
    await useCleanDatabase('mysql', { logger: 'simple-console' }, async (connection) => {
      const logSpy = jest.spyOn(global.console, 'log')

      const result = await connection.query('select 1 as "1"')

      expect(logSpy).toHaveBeenCalledWith('query: select 1 as "1"')
      expect(logSpy).toBeCalledTimes(1)

      expect(result[0][1]).toBe(1)
    })
  })

  it('should create a table and be able to query it', async () => {
    await useCleanDatabase('mysql', { entities: [Post, Category] }, async (connection) => {
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

  it('should be able to insert in parallel', async () => {
    await useCleanDatabase('mysql', { entities: [Post, Category] }, async (connection) => {
      const postRepository = connection.getRepository(Post)

      const post = new Post()
      post.title = 'My First Post'
      post.text = 'Post Text'
      post.likesCount = 4

      const [post1, post2] = await Promise.all([postRepository.save(post), postRepository.save(post)])

      expect(post1).toBeTruthy()

      expect(post1.title).toBe('My First Post')
      expect(post1.text).toBe('Post Text')
      expect(post1.likesCount).toBe(4)

      expect(post2).toBeTruthy()

      expect(post2.title).toBe('My First Post')
      expect(post2.text).toBe('Post Text')
      expect(post2.likesCount).toBe(4)
    })
  })

  it('should be able to update a post', async () => {
    await useCleanDatabase('mysql', { entities: [Post, Category] }, async (connection) => {
      const postRepository = connection.getRepository(Post)

      const post = new Post()

      post.title = 'My First Post'
      post.text = 'Post Text'
      post.likesCount = 4
      post.publishedAt = new Date(2017, 1, 1)

      const insertResult = await postRepository.save(post)

      const postId = insertResult.id

      const dbPost = await postRepository.findOne({ id: postId })

      dbPost!.publishedAt = new Date()

      await postRepository.save(dbPost!)

      const updatedPost = await postRepository.findOne(postId)

      expect(updatedPost!.publishedAt > new Date(2017, 1, 1)).toBeTruthy()

      expect(dbPost!.title).toBe('My First Post')
      expect(dbPost!.text).toBe('Post Text')
      expect(dbPost!.likesCount).toBe(4)
    })
  })

  it('should be able to handle dates and multiple inserts', async () => {
    await useCleanDatabase('mysql', { entities: [Post, Category] }, async (connection) => {
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
    await useCleanDatabase('mysql', { entities: [Post, Category] }, async (connection) => {
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
        storedPost.id, { relations: ['categories'] },
      )

      expect(dbPost).toBeTruthy()
      expect(dbPost!.categories).toBeTruthy()
      expect(dbPost!.categories.length).toBe(2)
    })
  })

  it('should be able to update a date field by primary key', async () => {
    await useCleanDatabase('mysql', { entities: [Post, Category] }, async (connection) => {
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
      expect(getPost!.updatedAt).toBeFalsy()

      const updatedAt = new Date()
      getPost!.updatedAt = updatedAt
      await postRepository.save(getPost!)

      // Assert
      const dbPost = await postRepository.findOne(storedPost.id)
      expect(dbPost).toBeTruthy()

      expect(Math.abs(dbPost!.updatedAt!.getTime() / 1000 - updatedAt.getTime() / 1000)).toBeLessThanOrEqual(1)
    })
  })

  it('should be able to correctly deal with bulk inserts', async () => {
    await useCleanDatabase('mysql', { entities: [Category] }, async (connection) => {
      const categoryNames = ['one', 'two', 'three', 'four']
      const newCategories = categoryNames.map((name) => ({ name }))

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

  it('should handle date/time types', async () => {
    await useCleanDatabase('mysql', { entities: [DateEntity] }, async (connection) => {
      const dateEntity = new DateEntity()

      dateEntity.date = '2017-06-21'
      dateEntity.datetime = new Date()
      dateEntity.datetime.setMilliseconds(0) // set milliseconds to zero, because if datetime type specified without precision, milliseconds won't save in database
      dateEntity.timestamp = new Date()
      dateEntity.timestamp.setMilliseconds(0) // set milliseconds to zero, because if datetime type specified without precision, milliseconds won't save in database
      dateEntity.time = '15:30:00'
      dateEntity.year = 2017

      const newDateEntity = await connection.getRepository(DateEntity).save(dateEntity)

      const loadedDateEntity = (await connection.getRepository(DateEntity).findOne(newDateEntity.id))!

      // Assert
      expect(newDateEntity).toBeTruthy()
      expect(newDateEntity.date).toEqual(dateEntity.date)
      expect(newDateEntity.datetime.getTime()).toEqual(dateEntity.datetime.getTime())
      expect(newDateEntity.timestamp.getTime()).toEqual(dateEntity.timestamp.getTime())
      expect(newDateEntity.time).toEqual(dateEntity.time)
      expect(newDateEntity.year).toEqual(dateEntity.year)

      expect(loadedDateEntity).toBeTruthy()
      expect(loadedDateEntity.date).toEqual(dateEntity.date)
      expect(loadedDateEntity.datetime.getTime()).toEqual(dateEntity.datetime.getTime())
      expect(loadedDateEntity.timestamp.getTime()).toEqual(dateEntity.timestamp.getTime())
      expect(loadedDateEntity.time).toEqual(dateEntity.time)
      expect(loadedDateEntity.year).toEqual(dateEntity.year)
    })
  })

  it('should handle json types', async () => {
    await useCleanDatabase('mysql', { entities: [JsonEntity] }, async (connection) => {
      const jsonEntity = new JsonEntity()

      jsonEntity.simpleJson = { id: 1, name: 'Post' }

      const newJsonEntity = await connection.getRepository(JsonEntity).save(jsonEntity)

      const loadedJsonEntity = (await connection.getRepository(JsonEntity).findOne(newJsonEntity.id))!

      // Assert
      expect(newJsonEntity).toBeTruthy()
      expect(newJsonEntity.simpleJson).toEqual(jsonEntity.simpleJson)

      expect(loadedJsonEntity).toBeTruthy()
      expect(loadedJsonEntity.simpleJson).toEqual(jsonEntity.simpleJson)
    })
  })
})
