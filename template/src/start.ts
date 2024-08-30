import './global'
import CONFIG from '@config';
import express, {Application, Response, Request, IRouter} from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import {install_controller, install_core, install_middleware} from "@core";

const logs = () => {
    const message =
        `       ${CONFIG.name.toUpperCase()}
    -----------------------------
        HTTP Server listening 
        http://127.0.0.1:${CONFIG.port}
    -----------------------------
        on port  -> ${CONFIG.port}
        on debug -> ${CONFIG.debug}`;
    console.log(message);
    let count = (84 - 'Engine Listening'.length) / 2;
    let endMessage = `Engine Listening`;
    endMessage = endMessage.padStart(count, '-');
    endMessage = endMessage.padEnd(84, '-');
    console.log(endMessage);
}

const start = async () => {
    let resolve: (value: any) => any, reject: (value: any) => any;
    const promise = new Promise((a, b) => {
        resolve = a;
        reject = b;
    })
    console.log(`======================= Engine Start =======================`);
    await install_core();

    const app: Application = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser('x-u-cookie'));
    if (CONFIG.session) {
        app.use(session(CONFIG.session));
    }

    const router: IRouter = express.Router();
    if (CONFIG.access_control_allow) {
        router.use(async (req: Request, res: Response, next) => {
            for (const key in CONFIG.access_control_allow) {
                res.header(`Access-Control-Allow-${key}`, CONFIG.access_control_allow[key]);
            }
            if (next) {
                next()
            }
        });
    }

    await install_middleware(router);
    await install_controller(router);

    app.use(router);

    app.listen(CONFIG.port, () => {
        logs()
        resolve(true)
    });
    return promise;
}

start().then(() => {})

