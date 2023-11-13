import 'reflect-metadata';
import "lia-common";
import CONFIG from './config';
import express, {Application, Router, Response} from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import Controller from './controller';

const start = async () => {
    let message = `Engine Start`;
    message = ('-'.padEnd(24,'-'))+message.padEnd(60, '-');
    console.log(message);
    console.log(`
  _      _                        _ 
 | |    (_)           /\\         (_)
 | |     _  __ _     /  \\   _ __  _ 
 | |    | |/ _\` |   / /\\ \\ | '_ \\| |
 | |____| | (_| |  / ____ \\| |_) | |
 |______|_|\\__,_| /_/    \\_\\ .__/|_|
                           | |      
                           |_|      
    `)
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
    // process.setMaxListeners(0);
    app.listen(CONFIG.port, () => {
        const engine_info: string =
            `        ${CONFIG.name} ${CONFIG.version}
    -----------------------------
        HTTP Server listening 
        http://127.0.0.1:${CONFIG.port}
    -----------------------------
        on env   -> ${CONFIG.NODE_ENV}
        on port  -> ${CONFIG.port}
        on debug -> ${CONFIG.debug}
        on args  -> ${JSON.stringify(CONFIG.NODE_ARGS)}`;
        console.log(engine_info);
        let message = `Engine Listening`;
        message = ('-'.padEnd(24,'-'))+message.padEnd(60, '-');
        console.log(message);

    });
}

start()

