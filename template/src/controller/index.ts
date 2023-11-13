import {Application, Router} from "express";

import {RequestWrapper, ResponseWrapper} from "../types";
import {CONTROLLER_METADATA, ROUTE_METADATA} from "../decorators";

const Rules = require('require-all')({
    dirname: __dirname + '/',
    filter: /^((?!index)).*$/,
    resolve: (controller: any) => {
        // console.log('Rules', 'controller==>>', controller)
        return controller.default
    }
});

class Controller {
    app: Router | Application;


    constructor(app: Router | Application) {
        this.app = app;
    }

    load() {
        console.log('Load Controller');
        console.log('-'.padEnd(84,'-'))
        console.log(' | ', 'Controller'.padEnd(13),' | ', 'Function'.padEnd(24),' | ','Method'.padEnd(6),' | ','path')
        console.log(' | ', '-'.padEnd(13,'-'),' | ', '-'.padEnd(24,'-'),' | ','-'.padEnd(6,'-'),' | ','-'.padEnd(19,'-'))

        for (const rulesKey in Rules) {
            let Rule = Rules[rulesKey];
            let instance = new Rule();
            this.loadRule(instance);
        }

        console.log('-'.padEnd(84,'-'))

    }

    loadRule(instance: any) {

        const controllerMetadata: string = Reflect.getMetadata(CONTROLLER_METADATA, instance.constructor);
        const proto = Object.getPrototypeOf(instance);
        const routeList = Object.getOwnPropertyNames(proto).filter(
            n => n !== 'constructor' && typeof proto[n] === 'function',
        );
        routeList.forEach(routeName => {
            let routeMetadata: any = Reflect.getMetadata(
                ROUTE_METADATA, proto[routeName],
            );
            if (routeMetadata) {
                let {type, path} = routeMetadata;
                let _path = '';
                if (controllerMetadata) {
                    _path = controllerMetadata;
                    // console.log('_path1',_path)
                } else {
                    _path = `/${instance.constructor.name.toLowerCase()}`;
                    // console.log('_path2',_path)
                }
                if (path) {
                    _path = `${_path}${path}`
                } else {
                    _path = `${_path}/*`
                }
                console.log(' | ', instance.constructor.name.padEnd(13),' | ', routeName.padEnd(24),' | ',type.toUpperCase().padEnd(6),' | ',_path)

                const request = (req: any, res: any,next:any) => {
                    instance.route({method:routeName,path:_path},new RequestWrapper(req), new ResponseWrapper(res));
                }
                if (type === 'get') {
                    // @ts-ignore
                    this.app.get(_path, request);
                } else if (type === 'post') {
                    // @ts-ignore
                    this.app.post(_path, request);
                } else {
                    // @ts-ignore
                    this.app.get(_path, request);
                    // @ts-ignore
                    this.app.post(_path, request);
                }
            }
        });
    }
}

export default Controller;
