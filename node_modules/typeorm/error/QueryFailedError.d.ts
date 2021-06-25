/**
 * Thrown when query execution has failed.
*/
export declare class QueryFailedError extends Error {
    query: string;
    parameters: any[];
    constructor(query: string, parameters: any[] | undefined, driverError: any);
}
