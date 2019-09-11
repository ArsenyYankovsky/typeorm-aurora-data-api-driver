const typeorm = require('typeorm')

const wakeUpDb = async () => {
  try {
    const connection = await typeorm.createConnection({
      type: 'aurora-data-api',
      database: process.env.database,
      secretArn: process.env.secretArn,
      resourceArn: process.env.resourceArn,
      region: process.env.region,
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

    const result = await connection.query('select 1')

    await connection.close()
  } catch (e) {
    // ignore timeout exception
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 60000)
  })
}

wakeUpDb()
