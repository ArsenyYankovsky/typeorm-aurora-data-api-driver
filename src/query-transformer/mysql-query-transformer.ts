import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata'
import {
  dateToDateString,
  dateToDateTimeString,
  dateToTimeString,
  simpleArrayToString,
  stringToSimpleArray,
} from '../utils/transform.utils'
import { QueryTransformer } from './query-transformer'

export class MysqlQueryTransformer extends QueryTransformer {
  preparePersistentValue(value: any, metadata: ColumnMetadata): any {
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
      case 'timestamp':
      case 'datetime':
      case Date:
        return {
          value: dateToDateTimeString(value),
          cast: 'DATETIME',
        }
      case 'decimal':
      case 'numeric':
        return {
          value: '' + value,
          cast: 'DECIMAL',
        }
      case 'set':
      case 'simple-array':
        return {
          value: simpleArrayToString(value),
        }
      case 'json':
      case 'simple-json':
        return {
          value: JSON.stringify(value),
        }
      case 'enum':
      case 'simple-enum':
        return {
          value: '' + value,
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
        return typeof value === 'string' ? new Date(value + ' GMT+0') : value
      case 'date':
        return dateToDateString(value)
      case 'year':
        return typeof value === 'string' ? new Date(value).getUTCFullYear() : value.getUTCFullYear()
      case 'time':
        return value
      case 'set':
      case 'simple-array':
        return typeof value === 'string' ? stringToSimpleArray(value) : value
      case 'json':
      case 'simple-json':
        return typeof value === 'string' ? JSON.parse(value) : value
      case 'enum':
      case 'simple-enum':
        if (metadata.enum && !Number.isNaN(value) && metadata.enum.indexOf(parseInt(value, 10)) >= 0) {
          return parseInt(value, 10)
        }
        return value
      default:
        return value
    }
  }

  protected transformQuery(query: string, parameters: any[]): string {
    const quoteCharacters = ["'", '"']
    let newQueryString = ''
    let currentQuote = null
    let srcIndex = 0
    let destIndex = 0

    for (let i = 0; i < query.length; i += 1) {
      const currentCharacter = query[i]
      const currentCharacterEscaped = i !== 0 && query[i - 1] === '\\'

      if (currentCharacter === '?' && !currentQuote) {
        const parameter = parameters![srcIndex]

        if (Array.isArray(parameter)) {
          // eslint-disable-next-line no-loop-func
          const additionalParameters = parameter.map((_, index) => `:param_${destIndex + index}`)

          newQueryString += additionalParameters.join(', ')
          destIndex += additionalParameters.length
        } else {
          newQueryString += `:param_${destIndex}`
          destIndex += 1
        }
        srcIndex += 1
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

    const expandedParameters = this.expandArrayParameters(parameters)

    return expandedParameters.map((parameter, index) => {
      if (parameter === undefined) {
        return parameter
      }

      if (typeof parameter === 'object' && parameter?.value) {
        return ({
          name: `param_${index}`,
          ...parameter,
        })
      }

      return {
        name: `param_${index}`,
        value: parameter,
      }
    })
  }

  protected expandArrayParameters(parameters: any[]): any[] {
    return parameters.reduce(
      (expandedParameters, parameter) => {
        if (Array.isArray(parameter)) {
          expandedParameters.push(...parameter)
        } else {
          expandedParameters.push(parameter)
        }
        return expandedParameters
      }, [],
    )
  }
}
