import {Request, Response} from 'express';
import {NetException} from "../exceptions";



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
        let cookies = String.toMap(cookiesString + "", ';', '=');
        cookies = cookies ? cookies : {};
        let query = request.query ? request.query : {};
        let body = request.body ? request.body : {};
        this.__COOKIES = cookies;
        this.__PARAMS = Object.assign(JSON.parse(JSON.stringify(query)), JSON.parse(JSON.stringify(body)))

    }
}

export class ResponseWrapper {
    responst: Response;

    constructor(responst: Response) {
        this.responst = responst;
    }

    onError(error: number | any, message?: string) {
        let result: any = {
            errno: 500,
            message: message,
            data: {}
        };
        if (error instanceof NetException) {
            result.errno = error.code;
            result.message = error.message;
        } else if (error instanceof Error) {
            result.message = error.message;
        }
        this.responst.json(result)
    }

    onResponse(errno: number | any, message: string = 'success', data: any = {}) {
        let result: any = {
            errno: errno,
            message: message,
            data: data
        };
        if (typeof errno === 'string' || isNaN(errno)) {
            let _data: any = errno;
            if (typeof errno === 'string') {
                _data = JSON.parse(errno);
            }
            if (!isNaN(_data.errno)) {
                result.errno = _data.errno;
            }
            if (_data.message) {
                result.message = _data.message;
            }
            if (_data.data) {
                result.data = _data.data;
            }
        }
        this.responst.json(result);
    }


}

export interface ControllerDataFormat<T> {
    (key: string,value?: any,data?:T): any;
}

export type RouteMeta={
    method:string,
    path:string,
    metadata?:any
}
