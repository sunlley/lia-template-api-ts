import {FullController} from "../types";
import {error} from "../utils";
import {Authorization, Controller, Get} from "lia-decorators";

@Controller('/graph')
class WatchControl extends FullController {


    @Get('/query')
    @Authorization(false)
    async action_query(params: any,req:any) {
        // data = JSON.parse(Buffer.from(data, "base64").toString());
        // error(5000)
        return{result:true}
    }


}

export default WatchControl;
