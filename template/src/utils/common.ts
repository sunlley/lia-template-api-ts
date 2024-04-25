import {ControllerDataFormat} from "../types";
import {AES, enc, MD5} from 'crypto-js';
import {NetException} from "../exceptions";

//注释：判断是否为空
export const isVaN = (value: any) => {
    return value == null || value.trim() === '';
}

export const random = (start: number, end: number) => {
    return Math.floor(Math.random() * (end - start)) + start;
}

/**
 * for reorganizing data structures
 * @param origin
 * @param rules
 * @param formats
 *
 * Example：
 *      const data1 = {name:"tom"}
 *      formatData(data1,["name=>nick"])
 *      console.log(data1)  =>> {nick:"tom"}
 *
 *      const data2 = {name:"tom"}
 *      formatData(data2,["name=nick"])
 *      console.log(data2)  =>> {name:"tom",nick:"tom"}
 *
 */
export const formatData = (origin: any, rules?: string[],
                           formats?: { [key in string]: ControllerDataFormat<any> }) => {
    if (!rules || rules.length === 0) {
        return origin;
    }
    for (let rule of rules) {
        if (!rule || rule.trim() === '') {
            continue;
        }
        rule = rule.trim();
        if (rule.indexOf('=>') >= 0) {
            if (formats && formats[rule]) {
                formats[rule](origin, rule);
            } else {
                let keys = rule.split('=>');
                if (keys.length < 2) {
                    continue;
                }
                origin[keys[1]] = origin[keys[0]];
                delete origin[keys[0]];
            }
        } else if (rule.indexOf('=') >= 0) {
            if (formats && formats[rule]) {
                formats[rule](origin, rule);
            } else {
                let keys = rule.split('=');
                if (keys.length < 2) {
                    continue;
                }
                origin[keys[1]] = origin[keys[0]];
                delete origin[rule];
            }
        } else {
            if (formats && formats[rule]) {
                formats[rule](origin, rule);
            }
        }
    }
    return origin;

}


/**
 * for null data in the organization object structure
 * The default deletes structures with a value of null
 * @param data
 * @param format
 */
export const formatDataNull = (data: any, format?: ControllerDataFormat<Object>) => {
    for (const dataKey in data) {
        let value = data[dataKey];
        if (value === null) {
            if (format) {
                value = format(dataKey, value, data);
                data[dataKey] = value
            }
        } else {
            delete data[dataKey];
        }
    }
    return data;
}

/**
 * Used to reorganize and remove data from structures
 * @param data
 * @param keys
 *
 * Example：
 *      const data1 = {name:"tom"，age:18}
 *      formatDataExclude(data1,["name"])
 *      console.log(data1)  =>> {age:18}
 */
export const formatDataExclude = (data: any, keys: string[]) => {
    for (const dataKey in data) {
        if (keys.indexOf(dataKey) >= 0) {
            delete data[dataKey];
        }
    }
    return data;
}
/**
 * Used to reorganize and preserve data in the structure
 * @param data
 * @param keys
 *
 * Example：
 *      const data1 = {name:"tom"，age:18}
 *      formatDataInclude(data1,["name"])
 *      console.log(data1)  =>> {name:"tom"}
 */
export const formatDataInclude = (data: any, keys: string[]) => {
    for (const dataKey in data) {
        if (keys.indexOf(dataKey) < 0) {
            delete data[dataKey];
        }
    }
    return data;
}
const DEFAULT_OFFSET = 'AABBCCDDEEFF';
export const encrypt = (message: string, password: string | null, offset?: string) => {
    if (password == null) {
        return message;
    }
    let key = enc.Hex.parse(MD5(password).toString());
    let result: any;
    let iv;
    if (offset) {
        iv = enc.Hex.parse(offset);
    } else {
        iv = enc.Hex.parse(DEFAULT_OFFSET);
    }
    result = AES.encrypt(message, key, {iv});
    return result.toString();
}

export const decrypt = (message: string, password: string | null, offset?: string) => {
    if (password == null) {
        return message;
    }
    let key = enc.Hex.parse(MD5(password).toString());
    let result: any;
    let iv;
    if (offset) {
        iv = enc.Hex.parse(offset);
    } else {
        iv = enc.Hex.parse(DEFAULT_OFFSET);
    }
    result = AES.decrypt(message, key, {iv});
    return result.toString(enc.Utf8);
}

export const delay = (time: number = 1000) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true)
        }, time);
    })
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

