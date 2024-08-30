import {install as installMysql} from "./mysql";
import {install as installRedis} from "./redis";
import Controller from "./controller";
import {loadMiddleware} from "@utils";

export const install_core = async (config?:any) => {
    await installMysql(config);
    await installRedis(config);

}
export const install_middleware = async (app:any) => {
    const middlewares = await loadMiddleware(__dirname + '/../middleware');
    Object.values(middlewares).forEach((install) => {
        install(app)
    })
}
export const install_controller = async (app:any) => {
    new Controller(app).load();
}
