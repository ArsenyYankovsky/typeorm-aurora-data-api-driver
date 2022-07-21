# typeorm-aurora-data-api-driver
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[badge-all-contributors]: https://img.shields.io/badge/all_contributors-2-orange.svg
<!-- ALL-CONTRIBUTORS-BADGE:END -->
[![typeorm-aurora-data-api-driver](https://circleci.com/gh/ArsenyYankovsky/typeorm-aurora-data-api-driver.svg?style=shield)](https://app.circleci.com/pipelines/github/ArsenyYankovsky/typeorm-aurora-data-api-driver)
[![npm downloads](https://img.shields.io/npm/dw/typeorm-aurora-data-api-driver)](https://www.npmjs.com/package/typeorm-aurora-data-api-driver)
![All Contributors][badge-all-contributors]
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ArsenyYankovsky/typeorm-aurora-data-api-driver/blob/master/LICENSE)
[![npm downloads](https://img.shields.io/bundlephobia/minzip/typeorm-aurora-data-api-driver)](https://www.npmjs.com/package/typeorm-aurora-data-api-driver)

### Description

This project is a bridge between [TypeORM](https://typeorm.io/#/) and [Aurora Data API](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html). It allows you to migrate to Aurora Data API which is extremely useful is serverless environments by only modifying the connection configuration. 

✔ Supports both Postgres and MySQL.

✔ Supports casting (allows using UUID, enums, properly formats date and time columns).

⚠ Data API currently destroys any timezone information returning everything in UTC. Be aware of that when using Postgres 'timestamp with time zone', 'time with time zone' and similar types.

### How to use

- [Enable the Data API on your database](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html)
- Install the driver by running either
```bash
yarn add typeorm-aurora-data-api-driver
```
or
```bash
npm i --save typeorm-aurora-data-api-driver
````

- Modify your connection configuration to look similar to this:

```js
    const connection = await createConnection({
      type: 'aurora-mysql',
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
      type: 'aurora-postgres',
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

Alternative way of automatically cast your UUID ids is to enable automatic casting of UUID (based on regex) by passing `enableUuidHack: true` to `formatOptions`.

## Developing This Driver

If you want to fix a bug or add a feature for this driver, this section will help you get started.
Let's start with a simple case where you don't need to touch any code in the TypeORM itself.

### Prerequisites

- node.js
- docker
- docker-compose

### Developing Against a Released TypeORM version

#### Initial Setup

1. Fork this repository on GitHub and check out your fork 
2. Run `yarn` to install dependencies
3. Install TypeORM by running `npm i --no-save typeorm`. You can also install a specific version of the ORM.
4. Run `yarn build` to build the code of the driver itself. You will also need to run this command when you make changes in the files under `/src` directory.

After that, you can run tests to validate your setup.

#### Running Tests

1. Start a docker image with a database

For Postgres:
  
```shell
docker-compose -f docker/pg.yml up -d
```

For MySQL:
  
```shell
docker-compose -f docker/mysql.yml up -d
```

2. Run Functional Tests

For Postgres:

```shell
yarn test:pg-func
```

For MySQL

```shell
yarn test:mysql-func
```

#### Adding a Feature / Fixing a Bug

Once you verified that your setup is correct by running tests, it's time to actually make changes you'd like.
A perfect start would be writing a test for your scenario. 

### Developing against a local TypeORM Version

Some features like adding a connection option would require making changes in both TypeORM 
and this driver.

To develop against a local TypeORM repository, you'll need to replace 
the third step from the initial setup section with the following:

1. In the driver directory, run `yarn link`
2. Fork the TypeORM repository and check out your fork
3. In the TypeORM directory, run `npm i` to install TypeORM dependencies
4. In the TypeORM directory, run `npm run package` to build TypeORM package
5. Under the `build/package` directory in the TypeORM project, run the following command to make sure the TypeORM is not linked: `yarn unlink`
6. Under the `build/package` directory in the TypeORM project, run two following commands: `yarn link` and `yarn link typeorm-aurora-data-api-driver`
7. In the driver directory, run `yarn link typeorm`

What this will do is create symlinks where the driver will use a locally built TypeORM package and a locally built TypeORM package will use a locally built driver.

```
<driver repo directory>/node_modules/typeorm -> <typeorm repo directory>/build/package
<typeorm repo directory>/build/package/node_modules/typeorm-aurora-data-api-driver -> <driver repo directory>
```

Unfortunately, every time you need to make a change in the TypeORM directory you'll need to rerun steps 
4-7 which is very slow. Please submit a PR updating this readme if you find a nicer way of doing it.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://danielpecos.com"><img src="https://avatars.githubusercontent.com/u/584298?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Pecos Martinez</b></sub></a><br /><a href="https://github.com/ArsenyYankovsky/typeorm-aurora-data-api-driver/commits?author=dpecos" title="Code">💻</a> <a href="https://github.com/ArsenyYankovsky/typeorm-aurora-data-api-driver/issues?q=author%3Adpecos" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/calvin-summer"><img src="https://avatars.githubusercontent.com/u/74207091?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Calvin</b></sub></a><br /><a href="https://github.com/ArsenyYankovsky/typeorm-aurora-data-api-driver/commits?author=calvin-summer" title="Code">💻</a> <a href="https://github.com/ArsenyYankovsky/typeorm-aurora-data-api-driver/commits?author=calvin-summer" title="Documentation">📖</a> <a href="https://github.com/ArsenyYankovsky/typeorm-aurora-data-api-driver/commits?author=calvin-summer" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
