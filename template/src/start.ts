import 'reflect-metadata';
import CONFIG from './config';
import express, {Application, Router, Response} from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import Controller from './controller';
import {install_core} from "./core";

const start = async () => {
    console.log(`======================= Engine Start =======================`);
    await install_core();
    console.log('core loaded')


    const app: Application = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser('x-u-cookie'));
    app.use(session({
        secret: '12345',
        cookie: {maxAge: 10000},
        resave: false,
        saveUninitialized: true,
    }));

    const router: Router = express.Router();
    if (CONFIG.AccessControlAllow) {
        router.use(async (req, res: Response, next) => {
            for (const key in CONFIG.AccessControlAllow) {
                res.header(`Access-Control-Allow-${key}`, CONFIG.AccessControlAllow[key]);
            }
            if (next) {
                next()
            }
        });
    }

    new Controller(router).load();

    app.use(router);

    app.listen(CONFIG.port, () => {
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

    });
}


start()

