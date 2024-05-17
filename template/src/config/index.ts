import '../global';
import * as process from "process";

const match_config = () => {
    let config:any = require('./config.common.js');
    try {
        let _config = require(
            process.env.NODE_ENV==='production'?
                './config.production.js':
                './config.development.js'
        );
        config={
            ...config,
            ..._config
        }
    } catch (e) {
        // console.log('config',e)
    }
    return config;
}
const CONFIG = match_config();
global.CONFIG = CONFIG;
export default CONFIG;
