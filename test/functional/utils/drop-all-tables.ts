import { Connection } from 'typeorm'

export const dropAllTables = async (connection: Connection) => {
  await connection.synchronize(true)
}

export const dropAllTablesAndCloseConnection = async (connection: Connection) => {
  await dropAllTables(connection)
  await connection.close()
}
