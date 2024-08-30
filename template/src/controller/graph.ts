import {AssertParams, Authorization, Controller, Get} from "lia-decorators";
import {FullController} from "@types";

@Controller('/graph')
class GraphControl extends FullController {


    @Get('/test')
    @Authorization(false)
    @AssertParams(['username', 'password'])
    async test(params:any){
        return{
            ...params,
            data:new Date(),
            message:"test success"
        }
    }
}

export default GraphControl;
