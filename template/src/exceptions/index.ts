import {default as EXCEPTIONS} from './exceptions'
import {isVaN} from "../utils";

export default EXCEPTIONS;
export class NetException extends Error {
    public readonly code: number;
    public readonly language: string;

    constructor(code: number,
                message = '',
                language = 'en') {

        let exception = EXCEPTIONS[code];
        if (!exception) {
            code = 500;
            exception = EXCEPTIONS[code];
        }
        message = isVaN(message) ? exception[language] : language;
        super(message);
        this.code = code;
        this.language = language;
    }
}
