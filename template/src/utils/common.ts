import * as fs from "node:fs";

export const isVaN = (value: any): boolean => {
    return value == null || value === '';
}
export const isStr = (value: any): boolean => {
    return typeof value === 'string';
}
export const isArr = (value: any): boolean => {
    return Array.isArray(value);
}
export const isNum = (value: any): boolean => {
    return !isNaN(value);
}

export const error = (options: {
    code?: number,
    message?: string,
    values?: any[]
} | number) => {
    if (typeof options === "number") {
        options = {code: options}
    }
    let {code, message, values} = options;
    code = code ?? 0;
    message = message ?? '';
    if (message == '' || message == undefined) {
        let exception = CONFIG.exceptions[code];
        message = exception ?? '';
    }
    let result = message.trim();
    if (values && values.length > 0) {
        for (let i = 0; i < values.length; i++) {
            result = result.replace(`%s${i}`, values[i]);
        }
    }
    throw new Error(`${code} # ${result}`);
}

export const assert = (params: any,
                       keys: (string | `${string}|${string}`)[] | ([_key: string | `${string}|${string}`, _default: any, _type: string])[],
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
        let _default: any;
        let _type: string | undefined;
        if (Array.isArray(key)) {
            if (key.length > 2) {
                [_key, _default, _type] = key;
            } else if (key.length > 1) {
                [_key, _default] = key;
            } else if (key.length > 0) {
                [_key] = key;
            }

        } else if (typeof key === 'string') {
            _key = key;
        }
        if (_key.indexOf('|') >= 0) {
            let nullCount = 0;
            let keysTemp = _key.split('|');
            let keyTemp = '';
            for (const keysTempElement of keysTemp) {
                let value = params[keysTempElement];
                if (isVaN(value)) {
                    nullCount++;
                } else {
                    keyTemp = keysTempElement;
                    check_value(keysTempElement, value, _type);
                }
            }
            if (nullCount === keysTemp.length) {
                if (_default != undefined) {
                    for (const key2 of keysTemp) {
                        params[key2] = _default;
                    }
                } else {
                    error({code: 1001, values: [_key]});

                }
            }
        } else {
            let value = params[_key];
            if (isVaN(params[_key])) {
                if (_default != undefined) {
                    params[_key] = _default;
                } else {
                    error({code: 1001, values: [_key]});
                }
            } else {
                check_value(_key, value, _type);
            }
        }


    }
}
export const isDir = (file: string) => {
    let stat = fs.lstatSync(file);
    return stat.isDirectory();
}
export const isFile = (file: string) => {
    let stat = fs.lstatSync(file);
    return stat.isFile();
}
export const loadMiddleware = async (dir: string): Promise<{ [key: string]: (app: any) => {} }> => {
    let files = fs.readdirSync(dir);
    let middlewares: { [key: string]: (app: any) => {} } = {};
    for (const file of files) {
        let check = isFile(dir + '/' + file)
        try {
            if (check) {
                let {install} = await import(dir + '/' + file);
                middlewares[file.substr(0, file.indexOf('.'))] = install;
            } else {
                let {install} = await import(dir + '/' + file + '/' + 'index');
                middlewares[file] = install;

            }
        } catch (e) {
            throw new Error(`no install found from ${file}`);
        }
    }
    return middlewares;
}
