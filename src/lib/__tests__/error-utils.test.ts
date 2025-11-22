/**
 * Error Utilities Tests
 * Testing error handling and message extraction
 */

import {
    getErrorMessage,
    getStatusMessage,
    isNetworkError,
    requiresReauth,
    isValidationError,
    getValidationErrors,
    ERROR_MESSAGES,
} from '../error-utils';

describe('error-utils', () => {
    describe('getErrorMessage', () => {
        it('should return fallback for null/undefined', () => {
            expect(getErrorMessage(null)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
            expect(getErrorMessage(undefined)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
        });

        it('should return string errors as-is', () => {
            expect(getErrorMessage('Custom error')).toBe('Custom error');
        });

        it('should extract message from Error instance', () => {
            const error = new Error('Error message');
            expect(getErrorMessage(error)).toBe('Error message');
        });

        it('should extract message from error object', () => {
            const error = { message: 'Object error' };
            expect(getErrorMessage(error)).toBe('Object error');
        });

        it('should handle network errors', () => {
            const error = { code: 'ERR_NETWORK' };
            expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.NETWORK_ERROR);
        });

        it('should extract message from API response', () => {
            const error = {
                response: {
                    data: {
                        message: 'API error message',
                    },
                },
            };
            expect(getErrorMessage(error)).toBe('API error message');
        });

        it('should use status code message when no message found', () => {
            const error = { statusCode: 404 };
            expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.NOT_FOUND);
        });
    });

    describe('getStatusMessage', () => {
        it('should return correct message for 400', () => {
            expect(getStatusMessage(400)).toBe(ERROR_MESSAGES.VALIDATION_ERROR);
        });

        it('should return correct message for 401', () => {
            expect(getStatusMessage(401)).toBe(ERROR_MESSAGES.INVALID_TOKEN);
        });

        it('should return correct message for 404', () => {
            expect(getStatusMessage(404)).toBe(ERROR_MESSAGES.NOT_FOUND);
        });

        it('should return correct message for 500', () => {
            expect(getStatusMessage(500)).toBe(ERROR_MESSAGES.SERVER_ERROR);
        });

        it('should return unknown error for unhandled status', () => {
            expect(getStatusMessage(418)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR); // I'm a teapot
        });
    });

    describe('isNetworkError', () => {
        it('should return true for network errors', () => {
            expect(isNetworkError({ code: 'ERR_NETWORK' })).toBe(true);
            expect(isNetworkError({ code: 'CORS_ERROR' })).toBe(true);
            expect(isNetworkError({ code: 'NETWORK_ERROR' })).toBe(true);
            expect(isNetworkError({ statusCode: 0 })).toBe(true);
        });

        it('should return false for non-network errors', () => {
            expect(isNetworkError({ code: 'OTHER_ERROR' })).toBe(false);
            expect(isNetworkError({ statusCode: 500 })).toBe(false);
            expect(isNetworkError('error string')).toBe(false);
            expect(isNetworkError(null)).toBe(false);
        });
    });

    describe('requiresReauth', () => {
        it('should return true for auth errors', () => {
            expect(requiresReauth({ code: 'AUTH_REQUIRED' })).toBe(true);
            expect(requiresReauth({ code: 'INVALID_TOKEN' })).toBe(true);
            expect(requiresReauth({ code: 'TOKEN_EXPIRED' })).toBe(true);
            expect(requiresReauth({ statusCode: 401 })).toBe(true);
        });

        it('should return false for non-auth errors', () => {
            expect(requiresReauth({ code: 'OTHER_ERROR' })).toBe(false);
            expect(requiresReauth({ statusCode: 500 })).toBe(false);
            expect(requiresReauth(null)).toBe(false);
        });
    });

    describe('isValidationError', () => {
        it('should return true for validation errors', () => {
            expect(isValidationError({ statusCode: 400 })).toBe(true);
            expect(isValidationError({ errors: { field: ['error'] } })).toBe(true);
        });

        it('should return false for non-validation errors', () => {
            expect(isValidationError({ statusCode: 500 })).toBe(false);
            expect(isValidationError(null)).toBe(false);
        });
    });

    describe('getValidationErrors', () => {
        it('should extract validation errors from error object', () => {
            const error = {
                errors: {
                    email: ['Email is required'],
                    password: ['Password too short'],
                },
            };
            expect(getValidationErrors(error)).toEqual(error.errors);
        });

        it('should extract validation errors from API response', () => {
            const error = {
                response: {
                    data: {
                        errors: {
                            username: ['Username taken'],
                        },
                    },
                },
            };
            expect(getValidationErrors(error)).toEqual({
                username: ['Username taken'],
            });
        });

        it('should return null when no validation errors found', () => {
            expect(getValidationErrors({ message: 'Error' })).toBeNull();
            expect(getValidationErrors(null)).toBeNull();
        });
    });
});
