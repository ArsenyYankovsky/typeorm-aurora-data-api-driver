export default class DataApiDriver {
    static transformQueryAndParameters(query: string, parameters?: any[]): any;
    private readonly region;
    private readonly secretArn;
    private readonly resourceArn;
    private readonly database;
    private readonly client;
    private readonly loggerFn?;
    private transaction;
    constructor(region: string, secretArn: string, resourceArn: string, database: string, loggerFn?: (query: string, parameters: any) => void);
    query(query: string, parameters?: any[]): Promise<any>;
    startTransaction(): any;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
}
