import {NetException} from "../exceptions";

export const isVaN = (value:any) => {
    return value == null || value === '';
}
export const randomString =  (length:number, type?:string) =>{
    if (length ===  0) { length = 6; }
    if (!type ) { type = 'normal'; }
    var e = '';
    var keys = '';
    if (type === 'number') {
        keys = '1234567890';
    }
    else if (type === 'all') {
        keys = '!@#$%^&*()_+ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    }
    else {
        keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    }
    for (var o = 0; o < length; o++) {
        e += keys.charAt(Math.floor(Math.random() * keys.length));
    }
    return e;
};
export const random = (start: number, end: number) => {
    return Math.floor(Math.random() * (end - start)) + start;
}

export const error = (options: {
    code: number,
    message?: string,
    language?: string,
    values?: any[]
} | number) => {
    if (typeof options === 'number') {
        throw new NetException(options, '', 'en');
    } else {
        let {code, message, language = 'en', values} = options;
        const exception = new NetException(code, message, language);
        if (!message) {
            message = exception.message;
        }
        if (values && values.length > 0) {
            for (let i = 0; i < values.length; i++) {
                message = message.replace(`%s${i}`, values[i]);
            }
            exception.message = message;
        }
        exception.message = message;
        throw exception;
    }
}

export const assert = (params: any,
                       keys: (string | `${string}|${string}`)[] | ([_key: string | `${string}|${string}`, _type: string])[],
                       tag?: string) => {
    const check_value = (key: string, value: any, type: any) => {
        if (type === 'array') {
            if (!Array.isArray(value)) {
                error({code: 1002, values: [key, type]});
            }
        } else if (type === 'number') {
            if (isNaN(value)) {
                error({code: 1002, values: [key, type]});
            }
        } else if (type === 'string') {
            if (typeof value !== 'string') {
                error({code: 1002, values: [key, type]});
            }
        }

    }
    for (let key of keys) {
        let _key = '';
        let _type:string|undefined;
        if (Array.isArray(key)) {
            [_key, _type] = key;
        } else if (typeof key === 'string') {
            _key = key;
        }
        if (_key.indexOf('|') >= 0) {
            //都为空时 报错
            let nullCount = 0;
            let keysTemp = _key.split('|');
            for (const keysTempElement of keysTemp) {
                let value = params[keysTempElement];
                if (isVaN(value)) {
                    nullCount++;
                }else {
                    check_value(keysTempElement, value,_type);
                }
            }
            if (nullCount === keysTemp.length) {
                error({code: 1001, values: [_key]});
            }
        } else {
            let value = params[_key];
            if (isVaN(params[_key])) {
                error({code: 1001, values: [_key]});
            }else {
                check_value(_key, value,_type);
            }
        }


    }
}
