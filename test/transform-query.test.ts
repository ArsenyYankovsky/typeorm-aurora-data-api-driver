import DataApiDriver from '../src/typeorm-data-api-driver'

describe('aurora data api > query transformation', () => {

  it('should correctly transform a single parameter query', async () => {
    const query = 'select * from posts where id = ?'
    const parameters = [1]

    const result = DataApiDriver.transformQueryAndParameters(query, parameters)

    expect(result.queryString).toEqual('select * from posts where id = :param_0')
    expect(result.parameters).toEqual([{ param_0: 1 }])
  })

  it('should correctly transform a query with escaped quotation marks', async () => {
    const query = 'select * from posts where id = ? and text = "?" and title = "\\"?\\""'
    const parameters = [1]

    const result = DataApiDriver.transformQueryAndParameters(query, parameters)

    expect(result.queryString).toEqual('select * from posts where id = :param_0 and text = "?" and title = "\\"?\\""')
    expect(result.parameters).toEqual([{ param_0: 1 }])
  })

  it('should correctly transform a query with escaped apostrophes', async () => {
    const query = "select * from posts where id = ? and text = '?' and title = '\\'?\\'' and description = \"\'?\'\""
    const parameters = [1]

    const result = DataApiDriver.transformQueryAndParameters(query, parameters)

    expect(result.queryString).toEqual("select * from posts where id = :param_0 and text = '?' and title = '\\'?\\'' and description = \"\'?\'\"")
    expect(result.parameters).toEqual([{ param_0: 1 }])
  })
})
