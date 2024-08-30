import {Request, Response} from 'express';
export type SqlResult={
    fieldCount: number,
    affectedRows: number,
    insertId: number,
    info: string,
    serverStatus: number,
    warningStatus: number,
    changedRows: number,
}
export type RouteMeta = {
    method: string,
    path: string,
    metadata?: any
}

export class RequestWrapper {
    request: Request;
    __PATH: string;
    __COOKIES: any;
    __PARAMS: any;

    constructor(request: Request) {
        this.request = request;
        this.__PATH = request.path;
        let cookiesString = request.headers['cookie'] ?
            request.headers['cookie'] : request.headers['Cookie'] ?
                request.headers['Cookie'] : request.headers['cookies'] ? request.headers['cookies'] : "";
        let cookies: any = {};
        if (cookiesString) {
            // cookiesString = (cookiesString+"").replace(/;/g, '&');
            cookiesString = cookiesString.toString();
            let items = cookiesString.split(';');
            if (items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    let index = item.indexOf('=');
                    if (index > 0) {
                        try {
                            let key = item.substring(0, index);
                            cookies[key] = item.substring(index + 1);
                        } catch (e) {
                        }
                    }
                }
            }
        }
        cookies = cookies ? cookies : {};
        let query = request.query ? request.query : {};
        let body = request.body ? request.body : {};
        this.__COOKIES = cookies;
        // this.__PARAMS = Object.assign(JSON.parse(JSON.stringify(query)), JSON.parse(JSON.stringify(body)))
        this.__PARAMS = {...query,...body};
    }
}

export class ResponseWrapper {
    response: Response;

    constructor(response: Response) {
        this.response = response;
    }

    onError(error: string | { toString: () => string },
            option?: {
                errno?: number | string,
                message?: string,
                params?: any
            }) {
        let {errno, message, params} = option ?? {};
        const result: any = {
            errno: errno ?? 5000,
            message: message ?? '',
            data: {}
        };
        if (CONFIG.debug){
            result._params = params;
        }
        if (typeof error === 'string') {
            result.message = error;
        } else if (error) {
            result.message = error.toString()
        }
        this.response.json(result)
    }

    onResponse(data: any = {},
               option?: {
                   errno?: number | string | { toString: () => string }
                   message?: string,
                   params?: any
               }) {
        let {errno, message, params} = option ?? {};
        let result: any = {
            errno: errno ?? 0,
            message: message ?? 'success',
            data: data,
        };
        if (CONFIG.debug){
            result._params = params;
        }
        this.response.json(result);
    }


}


