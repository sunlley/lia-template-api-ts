import './global'
import CONFIG from '@config';
import {install_core} from "@core";

const start = async () => {
    console.log(`======================= Service Start =======================`);
    await install_core(CONFIG);
    console.log(`======================= Service Pending =======================`);
    //do something

}
start().then()

