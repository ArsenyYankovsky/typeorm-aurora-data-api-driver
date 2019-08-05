# typeorm-aurora-data-api-driver

### Description

This project is a bridge between [TypeORM](https://typeorm.io/#/) and [Aurora Data API](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html). It allows you to migrate to Aurora Data API which is extremely useful is serverless environments by only modifying the connection configuration. 

### How to use

- [Enable the Data API on your database](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html)
- Install the driver by running either
`
yarn add typeorm-aurora-data-api-driver
`
or
`
npm i --save typeorm-aurora-data-api-driver
`

- Modify your connection configuration to look similar to this:

```
    const connection = await createConnection({
      type: 'aurora-data-api',
      database: 'test-db',
      secretArn: 'arn:aws:secretsmanager:eu-west-1:537011205135:secret:xxxxxx/xxxxxx/xxxxxx',
      resourceArn: 'arn:aws:rds:eu-west-1:xxxxx:xxxxxx:xxxxxx',
      region: 'eu-west-1',
    })
```

After you done that you can use the connection just as you did with any other connection:

```
  const postRepository = connection.getRepository(Post)

  const post = new Post()

  post.title = 'My First Post'
  post.text = 'Post Text'
  post.likesCount = 4

  const insertResult = await postRepository.save(post)
```
