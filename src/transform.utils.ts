export const transformQuery = (query: string, parameters: any[]): [string, number, number] => {
  const quoteCharacters = ["'", '"']
  let newQueryString = ''
  let currentQuote = null
  let numberOfQueryStringParameters = 0
  let numberOfParameters = 0

  for (let i = 0; i < query.length; i += 1) {
    const currentCharacter = query[i]
    const currentCharacterEscaped = i !== 0 && query[i - 1] === '\\'

    if (currentCharacter === '?' && !currentQuote) {
      const parameter = parameters![numberOfQueryStringParameters]

      if (Array.isArray(parameter)) {
        const additionalParameters = parameter.map((_, index) =>
          `:param_${numberOfParameters + index}`)

        newQueryString += additionalParameters.join(', ')
        numberOfParameters += additionalParameters.length
      } else {
        newQueryString += `:param_${numberOfParameters}`
        numberOfParameters += 1
      }

      numberOfQueryStringParameters += 1
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

  return [newQueryString, numberOfParameters, numberOfQueryStringParameters]
}

export const transformParameters = (
  parameters: any[],
) => {
  if (parameters.length > 0) {
    return parameters.reduce(
      (params, parameter, index) => {
        params[`param_${index}`] = parameter
        return params
      }, {})
  }
}

const expandArrayParameters = (parameters: any[]) => {
  return parameters.reduce(
    (expandedParameters, parameter) => {
      if (Array.isArray(parameter)) {
        expandedParameters.push(...parameter)
      } else {
        expandedParameters.push(parameter)
      }
      return expandedParameters
    }, [])
}

export const transformQueryAndParameters = (query: string, parameters: any[] = []): any => {
  const [
    queryString,
    numberOfParameters,
    numberOfParametersInQueryString,
  ] = transformQuery(query, parameters)

  const expandedParameters = expandArrayParameters(parameters)

  if (numberOfParameters && expandedParameters.length % numberOfParameters !== 0) {
    throw new Error(
      `Number of parameters mismatch, got ${numberOfParametersInQueryString} in query string \
      and ${parameters.length} in input`)
  }

  const objects = chunkArray(expandedParameters, numberOfParameters)
  const transformedParameters = objects.map(transformParameters)

  return {
    queryString,
    parameters: transformedParameters,
  }
}

const chunkArray = (array: any[], chunkSize: number) => {
  return Array.from(
    { length: Math.ceil(array.length / chunkSize) },
    (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize),
  )
}
