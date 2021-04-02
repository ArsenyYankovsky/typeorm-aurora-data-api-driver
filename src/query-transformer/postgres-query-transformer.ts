import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata'
import { dateToDateString, dateToTimeString, dateToDateTimeString } from '../utils/transform.utils'
import { QueryTransformer } from './query-transformer'

export class PostgresQueryTransformer extends QueryTransformer {
  public preparePersistentValue(value:any, metadata: ColumnMetadata): any {
    if (!value) {
      return value
    }

    switch (metadata.type) {
      case 'date':
        return {
          value: dateToDateString(value),
          cast: 'DATE',
        }
      case 'time':
        return {
          value: dateToTimeString(value),
          cast: 'TIME',
        }
      case 'time with time zone':
        return {
          value: dateToTimeString(value),
          cast: 'time with time zone',
        }
      case 'timetz':
        return {
          value: dateToTimeString(value),
          cast: 'timetz',
        }
      case 'interval':
        return {
          value,
          cast: 'interval',
        }
      case 'timestamp':
      case 'datetime':
      case 'timestamp with time zone':
      case 'timestamptz':
        return {
          value: dateToDateTimeString(value),
          cast: 'TIMESTAMP',
        }
      case 'decimal':
      case 'numeric':
        return {
          value: '' + value,
          cast: 'DECIMAL',
        }
      case 'simple-json':
      case 'json':
      case 'jsonb':
        return {
          value: JSON.stringify(value),
          cast: 'JSON',
        }
      case 'uuid':
        return {
          value: '' + value,
          cast: 'UUID',
        }
      case 'simple-enum':
      case 'enum':
        return {
          value: '' + value,
          cast: metadata.enumName || `${metadata.entityMetadata.tableName}_${metadata.databaseName.toLowerCase()}_enum`,
        }
      default:
        return {
          value,
        }
    }
  }

  prepareHydratedValue(value: any, metadata: ColumnMetadata): any {
    if (value === null || value === undefined) {
      return value
    }

    switch (metadata.type) {
      case Boolean:
        return !!value
      case 'datetime':
      case Date:
      case 'timestamp':
      case 'timestamp with time zone':
      case 'timestamp without time zone':
      case 'timestamptz':
        return typeof value === 'string' ? new Date(value + ' GMT+0') : value
      case 'date':
        return value
      case 'time':
        return value
      case 'hstore':
        if (metadata.hstoreType === 'object') {
          const unescapeString = (str: string) => str.replace(/\\./g, (m) => m[1])
          const regexp = /"([^"\\]*(?:\\.[^"\\]*)*)"=>(?:(NULL)|"([^"\\]*(?:\\.[^"\\]*)*)")(?:,|$)/g
          const object: any = {};
          `${value}`.replace(regexp, (_, key, nullValue, stringValue) => {
            object[unescapeString(key)] = nullValue ? null : unescapeString(stringValue)
            return ''
          })
          return object
        }
        return value
      case 'json':
      case 'simple-json':
        return typeof value === 'string' ? JSON.parse(value) : value
      case 'enum':
      case 'simple-enum':
        if (metadata.isArray) {
          // manually convert enum array to array of values (pg does not support, see https://github.com/brianc/node-pg-types/issues/56)
          value = value !== '{}' ? (value as string).substr(1, (value as string).length - 2)
            .split(',') : []
          // convert to number if that exists in possible enum options
          return value.map((val: string) => (!Number.isNaN(+val) && metadata.enum!.indexOf(parseInt(val, 10)) >= 0 ? parseInt(val, 10) : val))
        }
        // convert to number if that exists in poosible enum options
        return !Number.isNaN(+value) && metadata.enum!.indexOf(parseInt(value, 10)) >= 0 ? parseInt(value, 10) : value

      default:
        return value
    }
  }

  protected transformQuery(query: string) {
    const quoteCharacters = ["'", '"']
    let newQueryString = ''
    let currentQuote = null

    for (let i = 0; i < query.length; i += 1) {
      const currentCharacter = query[i]
      const currentCharacterEscaped = i !== 0 && query[i - 1] === '\\'

      if (currentCharacter === '$' && !currentQuote) {
        newQueryString += ':param_'
      } else {
        newQueryString += currentCharacter

        if (quoteCharacters.includes(currentCharacter) && !currentCharacterEscaped) {
          if (!currentQuote) {
            currentQuote = currentCharacter
          } else if (currentQuote === currentCharacter) {
            currentQuote = null
          }
        }
      }
    }

    return newQueryString
  }

  protected transformParameters(parameters?: any[]) {
    if (!parameters) {
      return parameters
    }

    return parameters.map((parameter, index) => {
      if (parameter === null || parameter === undefined) {
        return parameter
      }

      if (typeof parameter === 'object' && parameter.value) {
        return ({
          name: `param_${index + 1}`,
          ...parameter,
        })
      }

      // Hack for UUID
      if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test('' + parameter)) {
        return {
          name: `param_${index + 1}`,
          value: '' + parameter,
          cast: 'uuid',
        }
      }

      return {
        name: `param_${index + 1}`,
        value: parameter,
      }
    })
  }
}
