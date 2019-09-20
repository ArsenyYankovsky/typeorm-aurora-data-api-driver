export const transformQuery = (query: string, parameters?: any[]): [string, number, number] => {
  const quoteCharacters = ["'", '"']

  let newQueryString = ''
  let currentQuote = null
  let numberOfParametersInQueryString = 0
  let totalAdditionalParameters = 0

  for (let i = 0; i < query.length; i += 1) {
    const currentCharacter = query[i]
    const currentCharacterEscaped = i !== 0 && query[i - 1] === '\\'

    if (currentCharacter === '?' && !currentQuote) {
      const parameter = parameters![numberOfParametersInQueryString]

      if (Array.isArray(parameter)) {
        const additionalParameters =
          parameter.map((_, index) => `:param_${numberOfParametersInQueryString + index}`)

        totalAdditionalParameters += additionalParameters.length - 1
        newQueryString += additionalParameters.join(', ')
        numberOfParametersInQueryString += 1
      } else {
        newQueryString += `:param_${numberOfParametersInQueryString + totalAdditionalParameters}`
        numberOfParametersInQueryString += 1
      }
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

  const totalNumberOfParameters = numberOfParametersInQueryString + totalAdditionalParameters
  return [newQueryString, numberOfParametersInQueryString, totalNumberOfParameters]
}

export const transformParameters = (
  parameters: any[] = [],
) => {
  let indexOffset = 0
  return [parameters.reduce(
    (parameterObject, parameter, index) => {
      if (Array.isArray(parameter)) {
        parameter.forEach((element) => {
          parameterObject[`param_${index + indexOffset}`] = element
          indexOffset += 1
        })
      } else {
        parameterObject[`param_${index + indexOffset}`] = parameter
      }
      return parameterObject
    }, {}),
  ]
}

export const transformQueryAndParameters = (query: string, parameters?: any[]): any => {
  const [
    queryString,
    numberOfParametersInQueryString,
  ] = transformQuery(query, parameters)

  if (parameters && parameters.length !== numberOfParametersInQueryString) {
    throw new Error(
      `Number of parameters mismatch, got ${numberOfParametersInQueryString} in query string \
      and ${parameters.length} in input`,
    )
  }

  return {
    queryString,
    parameters: transformParameters(parameters),
  }
}
