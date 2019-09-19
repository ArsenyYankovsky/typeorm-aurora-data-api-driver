import { connect } from 'tls'
import {
  Connection,
  ConnectionOptions,
  createConnection as typeormCreateConnection,
} from 'typeorm'

export const createConnection = async (partialOptions: Partial<ConnectionOptions> = {}) => {
  return typeormCreateConnection({
    ...partialOptions,
    type: 'aurora-data-api',
    database: process.env.database!,
    secretArn: process.env.secretArn!,
    resourceArn: process.env.resourceArn!,
    region: process.env.region!,
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
  partialOptions: Partial<ConnectionOptions> = {},
) => {
  const connection = await createConnection({ ...partialOptions, synchronize: false })
  await connection.dropDatabase()
  await connection.synchronize(true)
  return connection
}

export const useCleanDatabase = async (
  partialOptions: Partial<ConnectionOptions> = {},
  invoke: (connection: Connection) => Promise<void>,
) => {
  const connection = await createConnectionAndResetData(partialOptions)
  try {
    await invoke(connection)
  } finally {
    connection.close()
  }
}
