/**
 * Logger Tests
 * Testing logging utility functionality
 */

import { logger, Logger } from '../logger';

describe('logger', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleInfoSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleInfoSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('debug', () => {
        it('should log debug messages in test environment', () => {
            logger.debug('Debug message');
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('should include context when provided', () => {
            logger.debug('Debug message', { userId: '123' });
            expect(consoleLogSpy).toHaveBeenCalled();
        });
    });

    describe('info', () => {
        it('should log info messages', () => {
            logger.info('Info message');
            expect(consoleInfoSpy).toHaveBeenCalled();
        });
    });

    describe('warn', () => {
        it('should log warning messages', () => {
            logger.warn('Warning message');
            expect(consoleWarnSpy).toHaveBeenCalled();
        });
    });

    describe('error', () => {
        it('should log error messages', () => {
            logger.error('Error message');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should log error with Error instance', () => {
            const error = new Error('Test error');
            logger.error('Error occurred', error);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should log error with context', () => {
            logger.error('Error occurred', undefined, { operation: 'test' });
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('success', () => {
        it('should log success messages', () => {
            logger.success('Success message');
            expect(consoleLogSpy).toHaveBeenCalled();
        });
    });

    describe('child logger', () => {
        it('should create child logger with prefix', () => {
            const childLogger = logger.child('Test');
            childLogger.info('Message');
            expect(consoleInfoSpy).toHaveBeenCalled();
        });
    });

    describe('Logger class', () => {
        it('should create custom logger instance', () => {
            const customLogger = new Logger('[Custom]');
            customLogger.info('Custom message');
            expect(consoleInfoSpy).toHaveBeenCalled();
        });
    });
});
