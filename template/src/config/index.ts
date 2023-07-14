import '../global';
const matchArgv = () => {
    const args = process.argv.slice(2);
    console.log('Start Args',args);
    let params:any={};
    let index=0;
    for (let i = 0; i < args.length; i++) {
        if (i<index){continue;}
        let arg=args[i];
        if (typeof arg ==='string'){
            arg = arg.trim();
            if (arg.indexOf('--')>=0){
                try {
                    let key = arg.replace('--', '');
                    let value = args[i + 1];
                    if (!value){
                        continue;
                    }
                    if (typeof value === 'string' && value.indexOf('--')>=0){
                        continue;
                    }
                    index = i + 1;
                    params[key] = value;
                } catch (e) {
                }
            }
        }
    }
    return params;
}
const NODE_ARGS=matchArgv();
process.env.NODE_ENV = NODE_ARGS.env?NODE_ARGS.env.toLowerCase():'development';
let config = require('./config.common');

if (process.env.NODE_ENV === "local") {
    try {
        let _config = require('./config.local');
        config = Object.assign(config, _config);
    } catch (e) {
    }
}
if (process.env.NODE_ENV === "development") {
    try {
        let _config = require('./config.dev');
        config = Object.assign(config, _config);
    } catch (e) {
    }
}
if (process.env.NODE_ENV === "production") {
    try {
        let _config = require('./config');
        config = Object.assign(config, _config);
    } catch (e) {
    }
}
config.NODE_ENV = process.env.NODE_ENV;
config.NODE_ARGS = NODE_ARGS;
global.CONFIG = config;
export default config;
