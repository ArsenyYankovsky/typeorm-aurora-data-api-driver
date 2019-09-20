export const transformQuery = (query: string, parameters?: any[]): [string, number] => {
  const quoteCharacters = ["'", '"']

  let newQueryString = ''
  let currentQuote = null
  let numberOfParametersInQueryString = 0
  let extendedParameterCount = 0

  for (let i = 0; i < query.length; i += 1) {
    const currentCharacter = query[i]
    const currentCharacterEscaped = i !== 0 && query[i - 1] === '\\'

    if (currentCharacter === '?' && !currentQuote) {
      const parameter = parameters![numberOfParametersInQueryString]

      if (Array.isArray(parameter)) {
        newQueryString += parameter
          .map(() => {
            const value = `:e_param_${extendedParameterCount}`
            extendedParameterCount += 1
            return value
          })
          .join(', ')
      } else {
        newQueryString += `:param_${numberOfParametersInQueryString}`
      }

      numberOfParametersInQueryString += 1
    } else {
      if (quoteCharacters.includes(currentCharacter) && !currentCharacterEscaped) {
        if (!currentQuote) {
          currentQuote = currentCharacter
        } else if (currentQuote === currentCharacter) {
          currentQuote = null
        }
      }

      newQueryString += currentCharacter
    }
  }

  return [newQueryString, numberOfParametersInQueryString]
}

export const transformParameters = (
  numberOfParametersInQueryString: number,
  parameters?: any[],
) => {
  if (
    parameters &&
    parameters.length > 0 &&
    parameters.length % numberOfParametersInQueryString !== 0
  ) {
    throw new Error(
      `Number of parameters mismatch, got ${numberOfParametersInQueryString} in query string \
      and ${parameters.length} in input`,
    )
  }

  let extendedParameterCount = 0
  const transformedParameters: any[] = []

  if (parameters && parameters.length > 0) {
    const numberOfObjects = parameters.length / numberOfParametersInQueryString

    for (let i = 0; i < numberOfObjects; i += 1) {
      const parameterObject: any = {}

      for (let y = 0; y < numberOfParametersInQueryString; y += 1) {
        const parameter = parameters[i + y]

        if (Array.isArray(parameter)) {
          parameter.forEach((element) => {
            parameterObject[`e_param_${extendedParameterCount}`] = element
            extendedParameterCount += 1
          })
        } else {
          parameterObject[`param_${y}`] = parameter
        }
      }

      transformedParameters.push(parameterObject)
    }
  }

  return transformedParameters
}

export const transformQueryAndParameters = (query: string, parameters?: any[]): any => {
  const [queryString, numberOfParametersInQueryString] = transformQuery(query, parameters)
  const transformedParameters = transformParameters(numberOfParametersInQueryString, parameters)

  return {
    queryString,
    parameters: transformedParameters,
  }
}
