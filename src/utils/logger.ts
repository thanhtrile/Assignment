import * as fs from 'fs';
import * as path from 'path';

export class Logger {
    static error(message: string, error?: any) {
        const logMessage = `[${new Date().toISOString()}] ERROR: ${message} - ${error?.message || error || 'Unknown Error'}\n`;
        console.error(logMessage);
        const logPath = path.join(__dirname, '../../test-errors.log');
        fs.appendFileSync(logPath, logMessage);
    }

    static info(message: string) {
        const logMessage = `[${new Date().toISOString()}] INFO: ${message}\n`;
        console.log(logMessage);
        const logPath = path.join(__dirname, '../../test-info.log');
        fs.appendFileSync(logPath, logMessage);
    }
}
