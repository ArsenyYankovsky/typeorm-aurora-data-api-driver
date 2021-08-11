import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata'

export interface QueryTransformationResult {
  queryString: string
  parameters: any[]
}

export abstract class QueryTransformer {
  protected transformOptions?: any

  public constructor(transformOptions?: any) {
    this.transformOptions = transformOptions
  }

  public transformQueryAndParameters(query: string, srcParameters: any[] = []) {
    if (!srcParameters.length) {
      return { queryString: query, parameters: [] }
    }

    const queryString = this.transformQuery(query, srcParameters)
    const parameters = this.transformParameters(srcParameters)
    return { queryString, parameters }
  }

  public abstract preparePersistentValue(value: any, metadata: ColumnMetadata): any

  public abstract prepareHydratedValue(value: any, metadata: ColumnMetadata): any

  protected abstract transformQuery(query: string, srcParameters: any[]): string

  protected abstract transformParameters(srcParameters?: any[]): any[] | undefined
}
