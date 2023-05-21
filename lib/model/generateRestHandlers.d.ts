import { RestContext, RestRequest, ResponseResolver } from 'msw';
import { ModelDictionary, ModelAPI, ModelDefinition } from '../glossary';
import { QuerySelectorWhere } from '../query/queryTypes';
import { OperationError } from '../errors/OperationError';
declare enum HTTPErrorType {
    BadRequest = 0
}
declare class HTTPError extends OperationError<HTTPErrorType> {
    constructor(type: HTTPErrorType, message?: string);
}
export declare function createUrlBuilder(baseUrl?: string): (path: string) => string;
export declare function getResponseStatusByErrorType(error: OperationError | HTTPError): number;
export declare function withErrors<RequestBodyType = any, RequestParamsType = any>(handler: ResponseResolver<RestRequest<RequestBodyType, RequestParamsType>, RestContext>): ResponseResolver<RestRequest<RequestBodyType, RequestParamsType>, RestContext>;
export declare function parseQueryParams<ModelName extends string>(modelName: ModelName, definition: ModelDefinition, searchParams: URLSearchParams): {
    cursor: string | null;
    skip: number | null;
    take: number | null;
    filters: QuerySelectorWhere<any>;
};
export declare function generateRestHandlers<Dictionary extends ModelDictionary, ModelName extends string>(modelName: ModelName, modelDefinition: ModelDefinition, model: ModelAPI<Dictionary, ModelName>, baseUrl?: string): import("msw").RestHandler<import("msw").MockedRequest<import("msw").DefaultRequestBody>>[];
export {};
