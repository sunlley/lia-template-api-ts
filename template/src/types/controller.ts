import {isVaN} from "../utils";
import Decimal from "decimal.js";

import {ControllerDataFormat, RequestWrapper, ResponseWrapper, RouteMeta} from '../types';
import {NetException} from "../exceptions";

export enum LANGUAGE {
    en = 'en',
    zh = 'zh'
}

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

export class ErrorController {
    constructor() {
    }

    error(options: any) {
        if (typeof options === 'number') {
            throw new NetException(options, '', 'en');
        } else {
            let {code, message, language = 'en', params} = options;
            let exception = new NetException(code, message, language);
            message = exception.message;
            if (params && params.length > 0) {
                for (let i = 0; i < params.length; i++) {
                    message = message.replace(`%s${i}`, params[i]);
                }
                exception.message = message;
            }
            throw exception;
        }
    }

}

export class ParamsController extends ErrorController {

    //断言cans
    assertParams(params: any, keys: string[] = []) {
        console.log(this.constructor.name, 'assertParams', params, keys)
        if (!params) {
            return;
        }
        for (let key of keys) {
            if (key.indexOf('|') >= 0) {
                //都为空时 报错
                let nullCount = 0;
                let keysTemp = key.split('|');
                for (const keysTempElement of keysTemp) {
                    if (isVaN(params[keysTempElement])) {
                        nullCount++;
                    }
                }
                if (nullCount === keysTemp.length) {
                    this.error({code: 101, params: [key]});
                }
            } else {
                if (isVaN(params[key])) {
                    this.error({code: 101, params: [key]});
                }
            }
        }
    }
}

export class BaseController extends ParamsController {
    public whiteList: string[];
    public controller: string;

    constructor(whiteList = []) {
        super()
        this.whiteList = whiteList;
        this.controller = this.constructor.name;
        this.route = this.route.bind(this);
    }

    page(params: any) {
        return new Page(params);
    }
    route(route:RouteMeta,req: RequestWrapper, res: ResponseWrapper){
        console.log('route', this.constructor.name, route);
            const _this:any = this;
            const onError = (error: any) => {
                console.log(this.controller, 'Error', error)
                res.onError(error);
            }
            const onResponse = (result: any) => {
                if (typeof result === 'object') {
                    if (result.hasOwnProperty('errno')
                        && result.hasOwnProperty('data')) {
                        if (!result.message) {
                            result.message = 'success';
                        }
                        res.onResponse(result);
                    } else {
                        res.onResponse({errno: 0, message: 'success', data: result});
                    }
                } else {
                    res.onResponse({errno: 0, message: 'success', data: {result}});
                }
            }

            (()=>{
                try {
                    console.log(this)
                    if (!_this[route.method]){
                        this.error({code: 501, params: [`${route.method}`]});
                        return
                    }
                    let params = Object.assign(Object.toSerialize(req.__COOKIES), req.__PARAMS);

                    const result = _this[route.method](params, req, res);
                    if (result instanceof Promise) {
                        result.then(result => {
                            onResponse(result)
                        }).catch(error => {
                            onError(error);
                        })
                    } else {
                        onResponse(result);
                    }
                } catch (error) {
                    onError(error);
                }
            })();
    }
}

