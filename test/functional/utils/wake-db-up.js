const typeorm = require('typeorm')

const dbType = process.argv[2]

const credentials = {
  mysql: {
    database: 'test',
    secretArn: process.env.MYSQL_SECRET_ARN,
    resourceArn: process.env.MYSQL_RESOURCE_ARN,
  },
  postgres: {
    database: 'postgres',
    secretArn: process.env.PG_SECRET_ARN,
    resourceArn: process.env.PG_RESOURCE_ARN,
  },
}

const wakeUpDb = async () => {
  try {
    const connection = await typeorm.createConnection({
      type: dbType === 'mysql' ? 'aurora-data-api' : 'aurora-data-api-pg',
      database: credentials[dbType].database,
      secretArn: credentials[dbType].secretArn,
      resourceArn: credentials[dbType].resourceArn,
      region: process.env.AWS_DEFAULT_REGION,
      logging: true,
      extra: {
        httpOptions: {
          connectTimeout: 120000,
        },
        maxRetries: 50,
        retryDelayOptions: {
          base: 10000,
        },
      },
    })
    await connection.query('select 1')
    await connection.close()
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 60000))
  }
}

wakeUpDb()
