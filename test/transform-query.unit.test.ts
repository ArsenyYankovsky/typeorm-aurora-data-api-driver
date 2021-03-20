import { MysqlQueryTransformer } from '../src/query-transformer'

describe('aurora data api > query transformation', () => {
  const transformer = new MysqlQueryTransformer()

  it('should correctly transform a query with no parameters', async () => {
    const query = 'select 1'
    const result = transformer.transformQueryAndParameters(query)

    expect(result.queryString).toEqual('select 1')
    expect(result.parameters).toEqual([])
  })

  it('should correctly transform a query with empty parameters', async () => {
    const query = 'select 1'
    const result = transformer.transformQueryAndParameters(query, [])

    expect(result.queryString).toEqual('select 1')
    expect(result.parameters).toEqual([])
  })

  it('should correctly transform a single parameter query', async () => {
    const query = 'select * from posts where id = ?'
    const parameters = [1]

    const result = transformer.transformQueryAndParameters(query, parameters)

    expect(result.queryString).toEqual('select * from posts where id = :param_0')
    expect(result.parameters).toEqual([{ name: 'param_0', value: 1 }])
  })

  it('should correctly transform a query with escaped quotation marks', async () => {
    const query = 'select * from posts where id = ? and text = "?" and title = "\\"?\\""'
    const parameters = [1]

    const result = transformer.transformQueryAndParameters(query, parameters)

    expect(result.queryString).toEqual(
      'select * from posts where id = :param_0 and text = "?" and title = "\\"?\\""',
    )
    expect(result.parameters).toEqual([{ name: 'param_0', value: 1 }])
  })

  it('should correctly transform a query with escaped apostrophes', async () => {
    const query = "select * from posts where id = ? and text = '?' and title = '\\'?\\'' and description = \"'?'\""
    const parameters = [1]

    const result = transformer.transformQueryAndParameters(query, parameters)

    expect(result.queryString).toEqual(
      "select * from posts where id = :param_0 and text = '?' and title = '\\'?\\'' and description = \"'?'\"",
    )
    expect(result.parameters).toEqual([{ name: 'param_0', value: 1 }])
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

    const result = transformer.transformQueryAndParameters(query, [1, 2, 3])

    expect(result.parameters).toEqual([{ name: 'param_0', value: 1 }, { name: 'param_1', value: 2 }, { name: 'param_2', value: 3 }])
  })

  it('should correctly transform a query which contains an array as a parameter', async () => {
    const query = 'select * from posts where id in (?) and id in (?)'

    const id = 'dd32d900-3df6-45b9-a253-70a4516b88dc'
    const id2 = 'some-guid'
    const result = transformer.transformQueryAndParameters(query, [id, [id, id2, id, id2]])

    expect(result.queryString).toEqual(
      'select * from posts where id in (:param_0) and id in (:param_1, :param_2, :param_3, :param_4)',
    )

    expect(result.parameters).toEqual(
      [{
        name: 'param_0',
        value: 'dd32d900-3df6-45b9-a253-70a4516b88dc',
      }, {
        name: 'param_1',
        value: 'dd32d900-3df6-45b9-a253-70a4516b88dc',
      }, {
        name: 'param_2',
        value: 'some-guid',
      }, {
        name: 'param_3',
        value: 'dd32d900-3df6-45b9-a253-70a4516b88dc',
      }, {
        name: 'param_4',
        value: 'some-guid',
      }],
    )
  })

  it('should correctly transform a query which contains two array parameters', async () => {
    const query = 'select * from posts where id in (?) and test in (?);'

    const id = 'dd32d900-3df6-45b9-a253-70a4516b88dc'
    const id2 = 'some-guid'
    const id3 = 'some-other-guid'
    const result = transformer.transformQueryAndParameters(query, [[id, id2, id, id2], [id3, id2, id, id3]])

    expect(result.queryString).toEqual(
      'select * from posts where id in (:param_0, :param_1, :param_2, :param_3) and test in (:param_4, :param_5, :param_6, :param_7);',
    )

    expect(result.parameters).toEqual(
      [{
        name: 'param_0',
        value: 'dd32d900-3df6-45b9-a253-70a4516b88dc',
      }, {
        name: 'param_1',
        value: 'some-guid',
      }, {
        name: 'param_2',
        value: 'dd32d900-3df6-45b9-a253-70a4516b88dc',
      }, {
        name: 'param_3',
        value: 'some-guid',
      }, {
        name: 'param_4',
        value: 'some-other-guid',
      }, {
        name: 'param_5',
        value: 'some-guid',
      }, {
        name: 'param_6',
        value: 'dd32d900-3df6-45b9-a253-70a4516b88dc',
      }, {
        name: 'param_7',
        value: 'some-other-guid',
      }],
    )
  })
})
