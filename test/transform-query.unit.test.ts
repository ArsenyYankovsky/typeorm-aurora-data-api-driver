import { transformQueryAndParameters } from '../src/transform.utils'

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

  it('should correctly transform a query which contains an array as a parameter', async () => {
    const query = 'select * from posts where id in (?) and id in (?)'

    const id = 'dd32d900-3df6-45b9-a253-70a4516b88dc'
    const id2 = 'some-guid'
    const result = transformQueryAndParameters(query, [id, [id, id2, id, id2]])

    expect(result.queryString).toEqual(
      'select * from posts where id in (:param_0) and id in (:e_param_0, :e_param_1, :e_param_2, :e_param_3)',
    )

    expect(result.parameters).toEqual([{ param_0: id, e_param_0: id, e_param_1: id2, e_param_2: id, e_param_3: id2 }])
  })
})
