
declare global{
    var [key]: any;
    var CONFIG:any
    interface Global {
        [key: string]: any;
        CONFIG:any;
    }
    // namespace NODEJS {
    //     interface Global {
    //         [key: string]: any;
    //         CONFIG:any;
    //     }
    // }

}

export interface global{}

