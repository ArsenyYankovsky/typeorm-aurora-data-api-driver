import * as AWS from 'aws-sdk'
import * as http from 'http'
import {
  Connection,
  ConnectionOptions,
  createConnection as typeormCreateConnection,
} from 'typeorm'

export const createConnection = async (dbType: DbType, partialOptions: any = {}) => {
  return typeormCreateConnection({
    ...partialOptions,
    name: dbType,
    type: dbType === 'mysql' ? 'aurora-data-api' : 'aurora-data-api-pg',
    database: 'test',
    secretArn: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:dummy',
    resourceArn: 'arn:aws:rds:us-east-1:123456789012:cluster:dummy',
    region: 'eu-west-1',
    logging: true,
    logger: 'simple-console',
    serviceConfigOptions: {
      endpoint: new AWS.Endpoint('http://127.0.0.1:8080'),
      httpOptions: {
        agent: new http.Agent(),
      },
    },
    formatOptions: {
      treatAsLocalDate: true,
    },
  })
}

export const createConnectionAndResetData = async (
  dbType: DbType,
  partialOptions: Partial<ConnectionOptions> = {},
) => {
  const connection = await createConnection(dbType, { ...partialOptions, synchronize: false })
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
