import {
  Connection,
  ConnectionOptions,
  createConnection as typeormCreateConnection,
} from 'typeorm'

export const createConnection = async (dbType: DbType, partialOptions: Partial<ConnectionOptions> = {}) => {
  return typeormCreateConnection({
    ...partialOptions,
    type: dbType === 'mysql' ? 'aurora-data-api' : 'aurora-data-api-pg',
    database: process.env[`${dbType}Database`]!,
    secretArn: process.env[`${dbType}SecretArn`]!,
    resourceArn: process.env[`${dbType}ResourceArn`]!,
    region: 'eu-west-1', // process.env.region!,
    logging: true,
    logger: 'simple-console',
    extra: {
      httpOptions: {
        connectTimeout: 120000,
      },
      maxRetries: 50,
      retryDelayOptions: {
        base: 10000,
      },
      ...(partialOptions.extra || {}),
    },
  })
}

export const createConnectionAndResetData = async (
  dbType: DbType,
  partialOptions: Partial<ConnectionOptions> = {},
) => {
  const connection = await createConnection(dbType, { ...partialOptions, synchronize: false })
  if (dbType === 'mysql') {
    await connection.query(`DROP DATABASE IF EXISTS ${process.env.database};`)
    await connection.query(`CREATE DATABASE ${process.env.database};`)
    await connection.query(`USE ${process.env.database};`)
  } else {
    await connection.query(`DROP schema IF EXISTS ${process.env.database} CASCADE;`)
    await connection.query(`CREATE schema ${process.env.database};`)
    await connection.query(`SET search_path = ${process.env.database};`)
  }
  await connection.synchronize(true)
  return connection
}

export type DbType = 'mysql' | 'postgres'

export const useCleanDatabase = async (
  dbType: DbType,
  partialOptions: Partial<ConnectionOptions> = {},
  invoke: (connection: Connection) => Promise<void>,
) => {
  const connection = await createConnectionAndResetData(dbType, partialOptions)
  try {
    await invoke(connection)
  } finally {
    await connection.close()
  }
}
