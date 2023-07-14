import {AssertParams, Get, Post} from "../decorators";
import {BaseController} from "../types";
class Test extends BaseController{

    constructor() {
        super();
    }

    @Get('/abc')
    @AssertParams(['name'])
    async action_test_get(params:any){
        let{name}=params;
        return params;
    }

    @Post()
    async action_test_post(params:any){
        return params;
    }

}
export default Test;
