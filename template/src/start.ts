import 'reflect-metadata';
import CONFIG from './config';
import express, {Application, Router, Response} from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import Controller from './controller';
import {getIPv4} from "lia-common";

const start = async () => {
    console.log(`======================= Engine Start =======================`)
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

    process.setMaxListeners(0);
    await app.listen(CONFIG.port, () => {
        let ip = getIPv4();
        let message =
`------------------------------------  
        ${CONFIG.name.toUpperCase()}
    -----------------------------
        HTTP Server listening 
        http://${ip.address}:${CONFIG.port}
    -----------------------------
        on env   -> ${CONFIG.NODE_ENV}
        on port  -> ${CONFIG.port}
        on debug -> ${CONFIG.debug}
        on args  -> ${JSON.stringify(CONFIG.NODE_ARGS)}
------------------------------------`;
        console.log(message);
    });
    console.log(`===================== Engine Listening =====================`)
}


start()

