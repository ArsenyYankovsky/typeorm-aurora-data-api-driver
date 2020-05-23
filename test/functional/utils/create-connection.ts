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
  })
}

export const createConnectionAndResetData = async (
  dbType: DbType,
  partialOptions: Partial<ConnectionOptions> = {},
) => {
  const connection = await createConnection(dbType, { ...partialOptions, synchronize: false })
  if (dbType === 'mysql') {
    // await connection.query(`DROP DATABASE IF EXISTS test;`)
    // await connection.query(`CREATE DATABASE test;`)
    // await connection.query(`USE test;`)
  } else {
    // await connection.query('DROP schema IF EXISTS test1 CASCADE;')
    // await connection.query('CREATE schema test1;')
    // await connection.query('SET search_path = test1;')
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
