import {Response, Request, NextFunction, IRouter} from 'express';

export const install = (app: IRouter) => {
    console.log('authorization.ts', 'install')
    app.use((req: Request, res: Response, next: NextFunction) => {
        const whiteList = app.whiteList!;
        const path = req.path;
        console.log('middleware', 'authorization', app.whiteList)
        let checked = true;
        if (whiteList.indexOf(path)<0) {
            console.log('middleware', 'authorization','验证授权', req.path)
        }
        if (checked){
            next()
        }else {
            // res.status(401).end();
            res.status(200).json({errno:4001,message:'Unauthorized'});
        }
    })
}