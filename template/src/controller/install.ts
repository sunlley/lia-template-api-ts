import {Application, IRouter} from "express";
import {BaseController, FullController, RequestWrapper, ResponseWrapper} from "../types";
import {AUTHORIZATION_METADATA, CONTROLLER_METADATA, ROUTE_METADATA} from "lia-decorators";
import "../global";

const Rules = require('require-all')({
    dirname: __dirname + '/',
    filter: /^((?!index|install)).*$/,
    resolve: (controller: any) => {
        // console.log('Rules', 'controller==>>', controller)
        return controller.default
    }
});

class Controller {
    // app: Router | Application;
    // app: Router;
    app: IRouter;

    constructor(app: IRouter | Application) {
        this.app = app;
    }

    load() {
        let logs = [];
        for (const rulesKey in Rules) {
            let Rule = Rules[rulesKey];
            let instance = new Rule();
            let log = this.loadController(instance);
            logs.push(...log);
        }
        let length_total = 0;
        let logs_length = [0, 0, 0, 0, 0];
        let logs_temp = [
            ['Controller', 'Function', 'Method', 'Path'],
            ['-', '-', '-', '-'],
            ...logs
        ];
        let logs_temp2 = [];
        for (const log of logs_temp) {
            let _log = [];
            for (let i = 0; i < log.length; i++) {
                let _log_item = `| ${log[i]}`;
                if (_log_item.length + 2 > logs_length[i]) {
                    logs_length[i] = _log_item.length + 2;
                }
                _log.push(_log_item);
            }
            logs_temp2.push(_log);
        }
        for (let i = 0; i < logs_temp2.length; i++) {
            let log = logs_temp2[i];
            let temp_total = 0;
            for (let j = 0; j < log.length; j++) {
                if (i === 1) {
                    log[j] = log[j].padEnd(logs_length[j], '-');
                } else {
                    log[j] = log[j].padEnd(logs_length[j], ' ');
                }
                if (j === log.length - 1) {
                    log[j] = log[j] + '|';
                }
                temp_total += log[j].length;
                if (length_total != temp_total) {
                    length_total = temp_total + 3;
                }
            }
        }
        console.log('-'.padEnd(length_total, '-'))
        for (let i = 0; i < logs_temp2.length; i++) {
            console.log(...logs_temp2[i])
            // if (i==0){
            //     console.log('-'.padEnd(length_total, '-'))
            // }
        }
        console.log('-'.padEnd(length_total, '-'))
        return this;

    }

    loadController(controller: BaseController) {
        let logs: (string[])[] = []
        const controllerMetadata: string = Reflect.getMetadata(CONTROLLER_METADATA, controller.constructor);
        const prototypes = Object.getPrototypeOf(controller);
        const functions = Object.getOwnPropertyNames(prototypes).filter((n) => {
            return n !== 'constructor' && typeof prototypes[n] === 'function'
        });
        let whiteList:string[]=[];
        for (const routeName of functions) {
            const request = (req: any, res: any, next: any, _path: string) => {
                controller.execute(
                    {method: routeName, path: _path, metadata: controller.constructor.name},
                    new RequestWrapper(req),
                    new ResponseWrapper(res));
            }
            const check_auth = (method: string, key?: string) => {
                if (key) {
                    // @ts-ignore
                    let value = controller[key];
                    if (value && Array.isArray(value)) {
                        // @ts-ignore
                        controller[key].push(method);
                    }
                } else {
                    if (controller.whiteList && Array.isArray(controller.whiteList)) {
                        controller.whiteList.push(method);
                    }
                }
            }
            const routeMetadata: any = Reflect.getMetadata(ROUTE_METADATA, prototypes[routeName],);
            let _path = '';
            if (routeMetadata) {
                let {type, path} = routeMetadata;
                if (controllerMetadata) {
                    _path = controllerMetadata;
                } else {
                    _path = `/${controller.constructor.name.toLowerCase()}`;
                }
                if (path) {
                    _path = `${_path}${path}`
                } else {
                    _path = `${_path}/*`
                }
                // logs = [' | ', controller.constructor.name.padEnd(13), ' | ', routeName.padEnd(24), ' | ', type.toUpperCase().padEnd(6), ' | ', _path]
                logs.push([controller.constructor.name, routeName, type, _path])

                if (type === 'get') {
                    this.app.get(_path, (req, res, next) => {
                        request(req, res, next, _path)
                    });
                } else if (type === 'post') {
                    this.app.post(_path, (req, res, next) => {
                        request(req, res, next, _path)
                    });
                } else if (type === 'put') {
                    this.app.put(_path, (req, res, next) => {
                        request(req, res, next, _path)
                    });
                } else if (type === 'delete') {
                    this.app.delete(_path, (req, res, next) => {
                        request(req, res, next, _path)
                    });
                } else if (type === 'patch') {
                    this.app.patch(_path, (req, res, next) => {
                        request(req, res, next, _path)
                    });
                }
            } else if (routeName.startsWith("action_")) {
                if (controllerMetadata) {
                    _path = controllerMetadata;
                } else {
                    _path = `/${controller.constructor.name.toLowerCase()}`;
                }
                let path = routeName.replace("action", routeName).trim();
                if (path) {
                    _path = `${_path}${path}`
                } else {
                    _path = `${_path}/*`
                }
                this.app.get(_path, (req, res, next) => {
                    request(req, res, next, _path)
                });
                this.app.post(_path, (req, res, next) => {
                    request(req, res, next, _path)
                });
            }
            const authMetadata: any = Reflect.getMetadata(AUTHORIZATION_METADATA, prototypes[routeName],);
            if (authMetadata) {
                // console.log('_path',_path)
                let {auth, key} = authMetadata;
                // console.log('authMetaData',authMetadata)
                if (!auth) {
                    whiteList.push(_path);
                    check_auth(routeName, key)
                }else {
                    if (controller.whiteList.indexOf(routeName)>=0){
                        whiteList.push(_path);
                    }
                }
            }else {
                if (controller.whiteList.indexOf(routeName)>=0){
                    whiteList.push(_path);
                }
            }
        }
        if (!this.app.whiteList){
            this.app.whiteList=[];
        }
        this.app.whiteList.push(...whiteList);

        return logs;
    }
}

export default Controller;