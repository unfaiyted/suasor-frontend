import { type components, ModelsErrorType } from './suasor.v1.d';
//
// export type Shorten = portusComponents['schemas']['models.Shorten'];
//
// export type ShortenResponse = portusComponents['schemas']['models.APIResponse-models_ShortenData'];
// export type ShortenData = portusComponents['schemas']['models.ShortenData'];
//
// export type ShortenErrorTypes = portusComponents['schemas']['models.ErrorType'];
// export type ShortenErrorResponse = portusComponents['schemas']['models.ErrorResponse-error'];
// export type CreateShortenRequest = portusComponents['schemas']['models.ShortenRequest'];

export type AuthData = components['schemas']['models.AuthData'];
export type ErrorType = components['schemas']['models.ErrorType'];
export type ErrorResponse = components['schemas']['models.ErrorResponse-error'];
export type UserConfigResponse = components['schemas']['models.APIResponse-models_UserConfig'];
export type AuthDataReponse = components['schemas']['models.APIResponse-models_AuthData'];
export type UserReponse = components['schemas']['models.APIResponse-models_UserResponse'];

export type ConfigurationReponse = components['schemas']['models.APIResponse-models_Configuration'];

export { ModelsErrorType };
