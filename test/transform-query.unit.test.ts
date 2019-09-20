import { transformQueryAndParameters } from '../src/typeorm-aurora-data-api-driver'

describe('aurora data api > query transformation', () => {
  it('should correctly transform a single parameter query', async () => {
    const query = 'select * from posts where id = ?'
    const parameters = [1]

    const result = transformQueryAndParameters(query, parameters)

    expect(result.queryString).toEqual('select * from posts where id = :param_0')
    expect(result.parameters).toEqual([{ param_0: 1 }])
  })

  it('should correctly transform a query with escaped quotation marks', async () => {
    const query = 'select * from posts where id = ? and text = "?" and title = "\\"?\\""'
    const parameters = [1]

    const result = transformQueryAndParameters(query, parameters)

    expect(result.queryString).toEqual(
      'select * from posts where id = :param_0 and text = "?" and title = "\\"?\\""',
    )
    expect(result.parameters).toEqual([{ param_0: 1 }])
  })

  it('should correctly transform a query with escaped apostrophes', async () => {
    const query =
      "select * from posts where id = ? and text = '?' and title = '\\'?\\'' and description = \"'?'\""
    const parameters = [1]

    const result = transformQueryAndParameters(query, parameters)

    expect(result.queryString).toEqual(
      "select * from posts where id = :param_0 and text = '?' and title = '\\'?\\'' and description = \"'?'\"",
    )
    expect(result.parameters).toEqual([{ param_0: 1 }])
  })

  it('should correctly transform a query that has closed apostrophes outside parameters', async () => {
    const query = `
    select sum(invocations) as invocations, sum(errors) as errors, sum(cost) as cost,
    CONVERT_TZ(TIMESTAMP(DATE(CONVERT_TZ(dateTime, 'UTC','UTC')), '00:00:00'),
    'UTC', 'UTC') as dateTime
    from LambdaStats
    where tenantId = ? and dateTime >= ? and dateTime <=?
    group by DATE(CONVERT_TZ(dateTime, 'UTC', 'UTC')) order by dateTime asc
  `

    const result = transformQueryAndParameters(query, [1, 2, 3])

    expect(result.parameters).toEqual([{ param_0: 1, param_1: 2, param_2: 3 }])
  })
})
