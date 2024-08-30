require('module-alias/register')

declare global{
    var CONFIG:{
        port:number,
        name:string,
        debug:boolean,
        access_control_allow?:{[key:string]:any}
        redis?:{[key:string]:any}|{
            url?: string;
            host?: string;
            port?: string | number;
            pingInterval?: number;
            username?: string;
            password?: string;
        },
        mysql?:{[key:string]:any}|{
            uri?: string;
            host?: string;
            port?: string | number;
            user?: string;
            password?: string;
            database?: string;
        },
        session?:{[key:string]:any}|{
            secret: string | string[],
            name?: string,
            cookie?: {
                maxAge?: number,
                partitioned?: boolean,
                priority?: "low" | "medium" | "high",
                signed?: boolean,
                expires?: Date,
                httpOnly?: boolean,
                path?: string ,
                domain?: string,
                secure?: boolean | "auto",
                sameSite?: boolean | "lax" | "strict" | "none"
            },
            resave: boolean,
            rolling?: boolean,
            proxy?: boolean,
            unset?: "destroy" | "keep"
            saveUninitialized?: boolean,
        },
        exceptions:{[key:string]:string}
        [key:string]:any
    }
}
declare module "express-serve-static-core" {
    interface Application{
        whiteList?:string[]
    }
    interface IRouter{
        whiteList?:string[]
    }
}
export interface global{}


