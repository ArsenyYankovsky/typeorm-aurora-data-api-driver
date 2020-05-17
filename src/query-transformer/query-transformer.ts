export interface QueryTransformationResult {
  queryString: string,
  parameters: any[],
}

export abstract class QueryTransformer {
  public transformQueryAndParameters(query: string, srcParameters: any[] = []) {
    if (!srcParameters.length) {
      return { queryString: query, parameters: [] }
    }

    const queryString = this.transformQuery(query, srcParameters)
    const parameters = this.transformParameters(srcParameters)
    return { queryString, parameters }
  }

  protected abstract transformQuery(query: string, srcParameters: any[]): string

  protected abstract transformParameters(srcParameters?: any[]): any[] | undefined
}
