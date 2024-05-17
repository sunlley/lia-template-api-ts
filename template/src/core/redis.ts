import {RedisInstaller} from "lia-redis";

export const install = async (_config?: any) => {
    console.log('Install Redis', 'Start')
    let config
    try {
        config = CONFIG.redis;
    } catch (e) {
        if (_config) {
            config = _config.redis;
        }
    }
    if (!config) {
        console.log('Install Redis', 'Done', 'No Config Found!')
        return;
    }
    // const config = {
    //     host: "127.0.0.1",
    //     port: 3306,
    //     user: "root",
    //     password: "root12345",
    //     database: "test"
    // }
    let installer = new RedisInstaller(config, global, 'error|info');
    await installer.load();
    console.log('Install Redis', 'Done', 'Complete')
}
