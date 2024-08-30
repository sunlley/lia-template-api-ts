import {MysqlInstaller} from "lia-mysql";

export const install = async (_config?: any) => {
    console.log('Install Mysql', 'Start')
    let config
    try {
        config = CONFIG.mysql;
    } catch (e) {
        if (_config) {
            config = _config.mysql;
        }
    }
    if (!config) {
        console.log('Install Mysql', 'Done', 'No Config Found!')
        return;
    }
    let installer = new MysqlInstaller(config, global, 'error|info');
    await installer.load();
    console.log('Install Mysql', 'Done', 'Complete')
}
