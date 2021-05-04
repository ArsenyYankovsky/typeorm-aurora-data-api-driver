# typeorm-aurora-data-api-driver

[![typeorm-aurora-data-api-driver](https://circleci.com/gh/ArsenyYankovsky/typeorm-aurora-data-api-driver.svg?style=shield)](https://app.circleci.com/pipelines/github/ArsenyYankovsky/typeorm-aurora-data-api-driver)
[![npm downloads](https://img.shields.io/npm/dw/typeorm-aurora-data-api-driver)](https://www.npmjs.com/package/typeorm-aurora-data-api-driver) 
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ArsenyYankovsky/typeorm-aurora-data-api-driver/blob/master/LICENSE)
[![npm downloads](https://img.shields.io/bundlephobia/minzip/typeorm-aurora-data-api-driver)](https://www.npmjs.com/package/typeorm-aurora-data-api-driver)


[![NPM](https://nodei.co/npm/typeorm-aurora-data-api-driver.png)](https://nodei.co/npm/typeorm-aurora-data-api-driver/)

### Description

This project is a bridge between [TypeORM](https://typeorm.io/#/) and [Aurora Data API](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html). It allows you to migrate to Aurora Data API which is extremely useful is serverless environments by only modifying the connection configuration. 

✔ Supports both Postgres and MySQL.

✔ Supports casting (allows using UUID, enums, properly formats date and time columns).

⚠ Data API currently destroys any timezone information returning everything in UTC. Be aware of that when using Postgres 'timestamp with time zone', 'time with time zone' and similar types.

⚠ Data API currently does not support some field types. Partial list of those field types: json, set

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

```js
    const connection = await createConnection({
      type: 'aurora-data-api',
      database: 'test-db',
      secretArn: 'arn:aws:secretsmanager:eu-west-1:537011205135:secret:xxxxxx/xxxxxx/xxxxxx',
      resourceArn: 'arn:aws:rds:eu-west-1:xxxxx:xxxxxx:xxxxxx',
      region: 'eu-west-1',
      serviceConfigOptions: {
        // additional options to pass to the aws-sdk RDS client
      },
      formatOptions: {
        // additional format options to pass to the Data API client
      }
    })
```

Or if you're using Postgres:


```js
    const connection = await createConnection({
      type: 'aurora-data-api-pg',
      database: 'test-db',
      secretArn: 'arn:aws:secretsmanager:eu-west-1:537011205135:secret:xxxxxx/xxxxxx/xxxxxx',
      resourceArn: 'arn:aws:rds:eu-west-1:xxxxx:xxxxxx:xxxxxx',
      region: 'eu-west-1',
      serviceConfigOptions: {
        // additional options to pass to the aws-sdk RDS client
      },
      formatOptions: {
        // additional format options to pass to the Data API client
      }
    })
```

After you done that you can use the connection just as you did with any other connection:

```js
  const postRepository = connection.getRepository(Post)

  const post = new Post()

  post.title = 'My First Post'
  post.text = 'Post Text'
  post.likesCount = 4

  const insertResult = await postRepository.save(post)
```


### Additional configuration options

This driver uses the [Data API Client](https://github.com/jeremydaly/data-api-client). To pass additional options to it, use `serviceConfigOptions` and `formatOptions` properties.

#### Automatic Casting

By default, this driver will try to cast entity fields on insert and update queries using entity metadata and [Data API client's type casting](https://github.com/jeremydaly/data-api-client#type-casting).
This allows using UUID and enum columns which wouldn't be possible before. To disable this behavior, set the `formatOptions.castParameters` to false.

#### Parameter Casting

You can specify casting for query parameters as well. To do that pass an object with properties `value` and `cast`

```js
const dbPost = await postRepository.findOne({
  title: {
    value: 'f01bdc12-ed72-4260-86aa-b7123f08cab9',
    cast: 'uuid',
  },
})
```
