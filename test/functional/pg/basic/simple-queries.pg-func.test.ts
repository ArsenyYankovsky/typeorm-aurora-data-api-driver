// eslint-disable-next-line import/no-extraneous-dependencies
import 'reflect-metadata'
import { useCleanDatabase } from '../../utils/create-connection'
import { Category } from './entity/Category'
import { DateEntity } from './entity/DateEntity'
import { JsonEntity } from './entity/JsonEntity'
import { SimpleArrayEntity } from './entity/SimpleArrayEntity'
import { Post } from './entity/Post'
import {
  HeterogeneousEnum,
  NumericEnum,
  SimpleEnumEntity,
  StringEnum,
  StringNumericEnum,
} from './entity/SimpleEnumEntity'
import User from './entity/User'
import { UuidPost } from './entity/UuidPost'

describe('aurora data api pg > simple queries', () => {
  jest.setTimeout(240000)

  it('should do a simple select', async () => {
    await useCleanDatabase('postgres', { logger: 'simple-console' }, async (connection) => {
      const logSpy = jest.spyOn(global.console, 'info')

      const result = await connection.query('select 1 as "1"')

      expect(logSpy).toHaveBeenCalledWith('query:', 'select 1 as "1"')
      expect(logSpy).toBeCalledTimes(1)

      expect(result[0][1]).toBe(1)
    })
  })

  it('should create a table and be able to query it', async () => {
    await useCleanDatabase('postgres', { entities: [Post, Category] }, async (connection) => {
      const postRepository = connection.getRepository(Post)

      const post = new Post()
      post.title = 'My First Post'
      post.text = 'Post Text'
      post.likesCount = 4

      const insertResult = await postRepository.save(post)

      const dbPost = await postRepository.findOneBy({ id: insertResult.id })
      expect(dbPost).toBeTruthy()

      expect(dbPost!.title).toBe('My First Post')
      expect(dbPost!.text).toBe('Post Text')
      expect(dbPost!.likesCount).toBe(4)
    })
  })

  it('should create a table with uuid primary key and be able to query it', async () => {
    await useCleanDatabase('postgres', { entities: [UuidPost, Category] }, async (connection) => {
      const postRepository = connection.getRepository(UuidPost)

      const post = new UuidPost()
      post.title = 'My First Post'
      post.text = 'Post Text'
      post.likesCount = 4

      const insertResult = await postRepository.save(post)

      const dbPost = await postRepository.findOneBy({
        id: {
          value: insertResult.id,
          // @ts-ignore
          cast: 'uuid',
        },
      })
      expect(dbPost).toBeTruthy()

      expect(dbPost!.title).toBe('My First Post')
      expect(dbPost!.text).toBe('Post Text')
      expect(dbPost!.likesCount).toBe(4)
    })
  })

  it('should create a table with uuid primary key and be able to query it -- with UUID hack', async () => {
    await useCleanDatabase('postgres', { entities: [UuidPost, Category], formatOptions: { enableUuidHack: true, castParameters: true } }, async (connection) => {
      const postRepository = connection.getRepository(UuidPost)

      const post = new UuidPost()
      post.title = 'My First Post'
      post.text = 'Post Text'
      post.likesCount = 4

      const insertResult = await postRepository.save(post)

      const dbPost = await postRepository.findOneBy({
        id: {
          value: insertResult.id,
          // @ts-ignore
          cast: 'uuid',
        },
      })
      expect(dbPost).toBeTruthy()

      expect(dbPost!.title).toBe('My First Post')
      expect(dbPost!.text).toBe('Post Text')
      expect(dbPost!.likesCount).toBe(4)
    })
  })

  it('should allow casting override', async () => {
    await useCleanDatabase('postgres', { entities: [UuidPost, Category] }, async (connection) => {
      const postRepository = connection.getRepository(UuidPost)

      const post = new UuidPost()
      post.title = 'f01bdc12-ed72-4260-86aa-b7123f08cab9'
      post.text = 'Post Text'
      post.likesCount = 4

      await postRepository.save(post)

      const dbPost = await postRepository.findOneBy({
        title: {
          value: 'f01bdc12-ed72-4260-86aa-b7123f08cab9',
          // @ts-ignore
          cast: 'varchar',
        },
      })

      expect(dbPost).toBeTruthy()

      expect(dbPost!.title).toBe('f01bdc12-ed72-4260-86aa-b7123f08cab9')
      expect(dbPost!.text).toBe('Post Text')
      expect(dbPost!.likesCount).toBe(4)
    })
  })

  it('should be able to insert in parallel', async () => {
    await useCleanDatabase('postgres', { entities: [UuidPost, Category] }, async (connection) => {
      const postRepository = connection.getRepository(UuidPost)

      const post = new UuidPost()
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

  it('should correctly save and retrieve enums', async () => {
    await useCleanDatabase('postgres', { entities: [UuidPost, Category, SimpleEnumEntity] }, async (connection) => {
      const enumEntityRepository = connection.getRepository(SimpleEnumEntity)

      const enumEntity = new SimpleEnumEntity()
      enumEntity.id = 1
      enumEntity.numericEnum = NumericEnum.EDITOR
      enumEntity.numericSimpleEnum = NumericEnum.EDITOR
      enumEntity.stringEnum = StringEnum.ADMIN
      enumEntity.stringNumericEnum = StringNumericEnum.TWO
      enumEntity.heterogeneousEnum = HeterogeneousEnum.YES
      enumEntity.arrayDefinedStringEnum = 'editor'
      enumEntity.arrayDefinedNumericEnum = 13
      enumEntity.enumWithoutdefault = StringEnum.ADMIN
      await enumEntityRepository.save(enumEntity)

      const loadedEnumEntity = await enumEntityRepository.findOneBy({ id: 1 })
      expect(loadedEnumEntity!.numericEnum).toBe(NumericEnum.EDITOR)
      expect(loadedEnumEntity!.numericSimpleEnum).toBe(NumericEnum.EDITOR)
      expect(loadedEnumEntity!.stringEnum).toBe(StringEnum.ADMIN)
      expect(loadedEnumEntity!.stringNumericEnum).toBe(StringNumericEnum.TWO)
      expect(loadedEnumEntity!.heterogeneousEnum).toBe(HeterogeneousEnum.YES)
      expect(loadedEnumEntity!.arrayDefinedStringEnum).toBe('editor')
      expect(loadedEnumEntity!.arrayDefinedNumericEnum).toBe(13)
    })
  })

  it('should be able to update a post', async () => {
    await useCleanDatabase('postgres', { entities: [Post, Category] }, async (connection) => {
      const postRepository = connection.getRepository(Post)

      const post = new Post()

      post.title = 'My First Post'
      post.text = 'Post Text'
      post.likesCount = 4
      post.publishedAt = new Date(2017, 1, 1)

      const insertResult = await postRepository.save(post)

      const postId = insertResult.id

      const dbPost = await postRepository.findOneBy({ id: postId })

      dbPost!.publishedAt = new Date()

      await postRepository.save(dbPost!)

      const updatedPost = await postRepository.findOneBy({ id: postId })

      expect(updatedPost!.publishedAt > new Date(2017, 1, 1)).toBeTruthy()

      expect(dbPost!.title).toBe('My First Post')
      expect(dbPost!.text).toBe('Post Text')
      expect(dbPost!.likesCount).toBe(4)
    })
  })

  it('should be able to handle dates and multiple inserts', async () => {
    await useCleanDatabase('postgres', { entities: [Post, Category] }, async (connection) => {
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
    await useCleanDatabase('postgres', { entities: [Post, Category] }, async (connection) => {
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
        {
          where: { id: storedPost.id },
          relations: ['categories'],
        },
      )

      expect(dbPost).toBeTruthy()
      expect(dbPost!.categories).toBeTruthy()
      expect(dbPost!.categories.length).toBe(2)
    })
  })

  it('should be able to update a date field by primary key', async () => {
    await useCleanDatabase('postgres', { entities: [Post, Category] }, async (connection) => {
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
      const getPost = await postRepository.findOneBy({ id: storedPost.id })
      expect(getPost).toBeTruthy()
      expect(getPost!.updatedAt).toBeFalsy()

      const updatedAt = new Date()
      getPost!.updatedAt = updatedAt
      await postRepository.save(getPost!)

      // Assert
      const dbPost = await postRepository.findOneBy({ id: storedPost.id })
      expect(dbPost).toBeTruthy()
      expect(Math.trunc(dbPost!.updatedAt!.getTime() / 1000)).toEqual(Math.trunc(updatedAt.getTime() / 1000))
    })
  })

  it('should be able to correctly deal with bulk inserts', async () => {
    await useCleanDatabase('postgres', { entities: [Category] }, async (connection) => {
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

  it('timestamptz issue', async () => {
    await useCleanDatabase('postgres', { entities: [User] }, async (connection) => {
      await connection.getRepository(User).save({ name: 'John' })
      const user = await connection.getRepository(User).findOneBy({ name: 'John' })

      // Assert
      expect(user).toBeTruthy()
      expect(user!.createdAt instanceof Date).toBeTruthy()
      expect(user!.updatedAt instanceof Date).toBeTruthy()
    })
  })

  it('should handle date and time types', async () => {
    await useCleanDatabase('postgres', { entities: [DateEntity] }, async (connection) => {
      const dateEntity = new DateEntity()

      dateEntity.date = '2017-06-21'
      dateEntity.interval = '1 year 2 months 3 days 4 hours 5 minutes 6 seconds'
      dateEntity.time = '15:30:00'
      dateEntity.timeWithTimeZone = '15:30:00 PST'
      dateEntity.timetz = '15:30:00 PST'
      dateEntity.timestamp = new Date()
      dateEntity.timestamp.setMilliseconds(0)
      dateEntity.timestampWithTimeZone = new Date()
      dateEntity.timestampWithTimeZone.setMilliseconds(0)
      dateEntity.timestamptz = new Date()
      dateEntity.timestamptz.setMilliseconds(0)

      const newDateEntity = await connection.getRepository(DateEntity).save(dateEntity)

      const loadedDateEntity = (await connection.getRepository(DateEntity).findOneBy({ id: newDateEntity.id }))!

      // Assert
      expect(loadedDateEntity).toBeTruthy()
      expect(loadedDateEntity.date).toEqual(dateEntity.date)
      expect(loadedDateEntity.time).toEqual(dateEntity.time)

      // Data API destroys the timezone information
      expect(loadedDateEntity.timeWithTimeZone).toEqual('23:30:00')
      expect(loadedDateEntity.timetz).toEqual('23:30:00')
      expect(loadedDateEntity.timestamp.valueOf()).toEqual(dateEntity.timestamp.valueOf())
      expect(loadedDateEntity.timestampWithTimeZone.getTime()).toEqual(dateEntity.timestampWithTimeZone.getTime())
      expect(loadedDateEntity.timestamptz.valueOf()).toEqual(dateEntity.timestamptz.valueOf())

      expect(loadedDateEntity).toBeTruthy()
      expect(loadedDateEntity.date).toEqual(dateEntity.date)
      expect(loadedDateEntity.time).toEqual(dateEntity.time)
      expect(loadedDateEntity.timeWithTimeZone).toEqual('23:30:00')
      expect(loadedDateEntity.timetz).toEqual('23:30:00')
      expect(loadedDateEntity.timestamp.valueOf()).toEqual(dateEntity.timestamp.valueOf())
      expect(loadedDateEntity.timestampWithTimeZone.getTime()).toEqual(dateEntity.timestampWithTimeZone.getTime())
    })
  })

  it('should handle json types', async () => {
    await useCleanDatabase('postgres', { entities: [JsonEntity] }, async (connection) => {
      const jsonEntity = new JsonEntity()

      jsonEntity.json = { id: 1, name: 'Post' }
      jsonEntity.jsonb = { id: 1, name: 'Post' }

      const newJsonEntity = await connection.getRepository(JsonEntity).save(jsonEntity)

      const loadedJsonEntity = (await connection.getRepository(JsonEntity).findOneBy({ id: newJsonEntity.id }))!

      // Assert
      expect(newJsonEntity).toBeTruthy()
      expect(newJsonEntity.json).toEqual(jsonEntity.json)
      expect(newJsonEntity.jsonb).toEqual(jsonEntity.jsonb)

      expect(loadedJsonEntity).toBeTruthy()
      expect(loadedJsonEntity.json).toEqual(jsonEntity.json)
      expect(loadedJsonEntity.jsonb).toEqual(jsonEntity.jsonb)
    })
  })

  it('should handle simple-array types', async () => {
    await useCleanDatabase('postgres', { entities: [SimpleArrayEntity] }, async (connection) => {
      const simpleArrayEntity = new SimpleArrayEntity()

      simpleArrayEntity.array = ['foo', 'bar']

      const newSimpleArrayEntity = await connection.getRepository(SimpleArrayEntity).save(simpleArrayEntity)

      const loadedSimpleArrayEntity = (await connection.getRepository(SimpleArrayEntity).findOneBy({ id: newSimpleArrayEntity.id }))!

      // Assert
      expect(newSimpleArrayEntity).toBeTruthy()
      expect(newSimpleArrayEntity.array).toEqual(simpleArrayEntity.array)

      expect(loadedSimpleArrayEntity).toBeTruthy()
      expect(loadedSimpleArrayEntity.array).toEqual(simpleArrayEntity.array)
    })
  })

  it('should handle empty simple-array', async () => {
    await useCleanDatabase('postgres', { entities: [SimpleArrayEntity] }, async (connection) => {
      const simpleArrayEntity = new SimpleArrayEntity()

      simpleArrayEntity.array = []

      const newSimpleArrayEntity = await connection.getRepository(SimpleArrayEntity).save(simpleArrayEntity)

      const loadedSimpleArrayEntity = (await connection.getRepository(SimpleArrayEntity).findOneBy({ id: newSimpleArrayEntity.id }))!

      // Assert
      expect(newSimpleArrayEntity).toBeTruthy()
      expect(newSimpleArrayEntity.array).toEqual([])

      expect(loadedSimpleArrayEntity).toBeTruthy()
      expect(loadedSimpleArrayEntity.array).toEqual([])
    })
  })

  it('should handle null values', async () => {
    await useCleanDatabase('postgres', { entities: [JsonEntity] }, async (connection) => {
      const jsonEntity = new JsonEntity()

      jsonEntity.json = null
      jsonEntity.jsonb = { id: 1, name: 'Post' }

      const newJsonEntity = await connection.getRepository(JsonEntity).save(jsonEntity)

      const loadedJsonEntity = (await connection.getRepository(JsonEntity).findOneBy({ id: newJsonEntity.id }))!

      // Assert
      expect(newJsonEntity).toBeTruthy()
      expect(newJsonEntity.json).toEqual(null)
      expect(newJsonEntity.jsonb).toEqual(jsonEntity.jsonb)

      expect(loadedJsonEntity).toBeTruthy()
      expect(loadedJsonEntity.json).toEqual(null)
      expect(loadedJsonEntity.jsonb).toEqual(jsonEntity.jsonb)
    })
  })
})
