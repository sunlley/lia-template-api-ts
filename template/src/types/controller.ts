import {inspect} from "node:util";
import {assert, error} from "@utils";
import {RequestWrapper, ResponseWrapper, RouteMeta} from './common';

export class Page {
    page: number;
    size: number;
    offset: number;
    startOffset: number;
    sql: string;

    constructor({page = 1, size = 100, startOffset = 0}: any) {
        this.page = page;
        this.size = size;
        this.offset = 0;
        this.startOffset = startOffset;
        this.sql = '';
        this.test();
    }

    test() {
        if (isNaN(this.page)) {
            this.page = 1;
        }
        if (this.page <= 0) {
            this.page = 1;
        }
        let page = this.page - 1;
        if (isNaN(this.size) || this.size < 1 || this.size > 100) {
            this.size = 100;
        }
        this.page = page + 1;
        this.offset = page * this.size;
        let size = this.size;
        if (page === 0 && this.startOffset > 0) {
            size = this.size = this.startOffset;
        }
        this.sql = ` limit ${size} offset ${this.offset} `;
        return this;
    }

    public get result() {
        return {page: this.page, size: this.size}
    }

}

export class BaseController {
    public whiteList: string[] = [];
    public controller: string;

    constructor(whiteList: string[] = []) {
        this.whiteList.push(...(whiteList ?? []));
        this.controller = this.constructor.name;
    }

    async formatData<T>(origin: any, rules: any, formats: any): Promise<T> {
        if (!rules || rules.length === 0) {
            return origin;
        }
        for (const rule of rules) {
            if (!rule) {
                continue;
            }
            if (rule.indexOf("|") < 0) {
                if (formats && formats[rule]) {
                    formats[rule](origin, rule);
                } else {
                    delete origin[rule];
                }
                continue;
            }
            let paramsKeys = rule.split('|');
            if (paramsKeys.length < 2) {
                continue;
            }
            if (formats && formats[rule]) {
                formats[rule](origin, paramsKeys[0], paramsKeys[1]);
            } else {
                if (origin[paramsKeys[0]]) {
                    let temp = origin[paramsKeys[0]];
                    delete origin[paramsKeys[0]];
                    origin[paramsKeys[1]] = temp;
                }
            }

        }
        return origin as T;
    }

    formatDateExclude(data: any, keys: string[]) {
        for (const dataKey in data) {
            if (keys.indexOf(dataKey) >= 0) {
                delete data[dataKey];
            }
        }
        return data;
    }

    formatDateInclude(data: any, keys: string[]) {
        for (const dataKey in data) {
            if (keys.indexOf(dataKey) < 0) {
                delete data[dataKey];
            }
        }
        return data;
    }

    formatDateTime(data: any, keys: string[]) {
        let __dateInfo: any = {};
        for (const key of keys) {
            try {
                const date = new Date(data[key]);
                data[key] = date.getTime();
                __dateInfo[key] = date.toISOString();
            } catch (e) {
            }
        }
        data.__dateInfo = __dateInfo;
        return data;
    }

    execute(route: RouteMeta, req: RequestWrapper, res: ResponseWrapper) {
        console.log(new Date(), 'Call==>>', this.constructor.name, '#-', route.path, "-|-", JSON.stringify(req.__PARAMS));
        const _this: any = this;

        const onError = (error: any, route: RouteMeta) => {
            console.log('-')
            console.log('-', route.metadata, route.path, new Date())
            console.error('-', inspect(error, {
                compact: true,
                depth: 1,
                colors: true,
                showHidden: false
            }))
            res.onError(error, {
                params: req.__PARAMS
            });
        }

        const onResponse = (result: any) => {
            if (typeof result === 'object') {
                if (result.hasOwnProperty('errno')) {
                    res.onResponse(result.data, {...result, params: req.__PARAMS});
                } else {
                    res.onResponse(result, {params: req.__PARAMS});
                }
            } else {
                res.onResponse(result, {params: req.__PARAMS});
            }
        }

        (() => {
            try {
                if ( _this[route.method] == undefined) {
                    error({code: 5001, values: [`${route.method}`]});
                    return
                }
                const params = {...req.__PARAMS}
                const result =  _this[route.method](params, req, res);
                if (result instanceof Promise) {
                    result.then(it => {
                        onResponse(it)
                    }).catch(error => {
                        onError(error, route);
                    })
                } else {
                    onResponse(result);
                }
            } catch (error: any) {
                onError(error, route);
            }
        })();
    }

}

export class ParamsController extends BaseController {
    constructor(whiteList: string[] = []) {
      super(whiteList);
    }
    assertParams(params: any, keys: string[] = []) {
        if (!params) {
            return;
        }
        assert(params, keys);
    }
}

export class FullController extends ParamsController {
    constructor(whiteList: string[] = []) {
        super(whiteList);
    }
    page(params: any) {
        return new Page(params);
    }

    execute(route: RouteMeta, req: RequestWrapper, res: ResponseWrapper) {
        super.execute(route, req, res);
    }

}


