import {Controller, Get} from "../decorators";
import {BaseController} from "../types";
import {error} from "../utils";

@Controller('/:chainId/graph')
class WatchControl extends BaseController {

    constructor() {
        super();
    }

    @Get('/query')
    async action_query(params: any,req:any) {
        // console.log('params ==>>',params)
        // console.log('req ==>>',req)
        // let {data, method} = params;
        // data = JSON.parse(Buffer.from(data, "base64").toString());
        error(5000)
    }


}

export default WatchControl;
