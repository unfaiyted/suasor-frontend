import { type components as portusComponents, ModelsErrorType } from './portus.v1.d';

export type Shorten = portusComponents['schemas']['models.Shorten'];

export type ShortenResponse = portusComponents['schemas']['models.APIResponse-models_ShortenData'];
export type ShortenData = portusComponents['schemas']['models.ShortenData'];

export type ShortenErrorTypes = portusComponents['schemas']['models.ErrorType'];
export type ShortenErrorResponse = portusComponents['schemas']['models.ErrorResponse-error'];
export type CreateShortenRequest = portusComponents['schemas']['models.ShortenRequest'];

export { ModelsErrorType };
