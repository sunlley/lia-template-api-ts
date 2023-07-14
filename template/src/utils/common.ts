import {ControllerDataFormat} from "../types";

export const isVaN = (value: any) => {
    return value == null || value === '';
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
        }else{
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
export const formatDataExclude=(data: any, keys: string[])=> {
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
export const formatDataInclude=(data: any, keys: string[])=> {
    for (const dataKey in data) {
        if (keys.indexOf(dataKey) < 0) {
            delete data[dataKey];
        }
    }
    return data;
}

export const formatDataTime=(data: any, keys: string[]) =>{
    let __dateInfo: any = {};
    for (const key of keys) {
        try {
            const date = new Date(data[key]);
            data[key] = date.getTime();
            __dateInfo[key] = date.toISOString();
        } catch (e) {
        }
    }
    data.__date_info = __dateInfo;
    return data;
}
