import * as AWS from 'aws-sdk'
import * as http from 'http'
import {
  DataSource,
  DataSourceOptions,
  createConnection as typeormCreateConnection,
} from 'typeorm'

// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config()

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

export const createConnection = async (dbType: DbType, partialOptions: any = {}) => typeormCreateConnection({
  ...partialOptions,
  name: dbType,
  type: dbType === 'mysql' ? 'aurora-mysql' : 'aurora-postgres',
  database: credentials[dbType].database,
  secretArn: credentials[dbType]?.secretArn || 'arn:aws:secretsmanager:us-east-1:123456789012:secret:dummy',
  resourceArn: credentials[dbType]?.resourceArn || 'arn:aws:rds:us-east-1:123456789012:cluster:dummy',
  region: 'eu-west-1',
  logging: true,
  logger: 'simple-console',
  serviceConfigOptions: !credentials[dbType]?.secretArn && {
    endpoint: new AWS.Endpoint('http://127.0.0.1:8080'),
    httpOptions: {
      agent: new http.Agent(),
    },
  },
})

export const createConnectionAndResetData = async (
  dbType: DbType,
  partialOptions: Partial<DataSourceOptions> = {},
) => {
  const connection = await createConnection(dbType, { ...partialOptions, synchronize: false })
  await connection.synchronize(true)
  return connection
}

export type DbType = 'mysql' | 'postgres'

export const useCleanDatabase = async (
  dbType: DbType,
  partialOptions: Partial<DataSourceOptions> = {},
  invoke: (connection: DataSource) => Promise<void>,
) => {
  const connection = await createConnectionAndResetData(dbType, partialOptions)
  try {
    await invoke(connection)
  } finally {
    await connection.close()
  }
}
