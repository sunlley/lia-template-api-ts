const DEFAULT_MAXAGE=Infinity;
type CacheItem = {
    timestamp:number,
    validUntilTimestamp: number;
    value?: any;
};

const Index:WeakMap<CacheItem,any> = new WeakMap();

const KEYS:Record<string, CacheItem|null> = {};
const LINKED: {
    action:string,
    key:string,
    task:any
}[]=[];

const loop = () => {
    while (LINKED.length>0){
        const item = LINKED.pop();
        item?.task();
    }
}

const gen_key = (key:string,maxAge?:number|null):CacheItem => {
    const validTime = Date.now() + (maxAge?maxAge:DEFAULT_MAXAGE);
    return{
        timestamp:Date.now(),
        validUntilTimestamp:validTime,
        value:key
    }
}
const push =async (key:string,value:any,maxAge?:number|null):Promise<boolean> => {
    return new Promise((resolve, reject)=>{
        LINKED.push({
            action:'push',
            key,
            task:()=>{
                let linked_key = KEYS[key];
                if (!linked_key){
                    linked_key =gen_key(key,maxAge);
                }else{
                    linked_key.timestamp = Date.now();
                    linked_key.validUntilTimestamp = Date.now() + (maxAge?maxAge:DEFAULT_MAXAGE);
                }
                KEYS[key]=linked_key;
                Index.set(linked_key,value);
                resolve(true);
            }
        });
        loop();
        // console.log('Storage.push',key,value);
        // console.log('Storage.push','Index',Index);
    });


}
const find = async <T=any>(key:string):Promise<T|undefined> => {
    return new Promise<T|undefined>((resolve, reject)=>{
        LINKED.push({
            action:'find',
            key,
            task:()=>{
                let linked_key = KEYS[key];
                if (!linked_key){
                    resolve(undefined);
                    return
                }
                let now = Date.now();
                if (now>linked_key.validUntilTimestamp){
                    KEYS[key]=null;
                    Index.delete(linked_key);
                    resolve(undefined);
                    return
                }
                resolve(Index.get(linked_key));
            }
        })
        loop();
    });
}
const remove = async (key:string):Promise<boolean> => {
    return new Promise((resolve, reject)=>{
        LINKED.push({
            action:'remove',
            key,
            task:()=>{
                let linked_key = KEYS[key];
                if (!linked_key){
                    resolve(true);
                    return;
                }
                KEYS[key]=null;
                Index.delete(linked_key);
                resolve(true);
            }
        });
        loop();
    });
}
const delay = async(time:number):Promise<boolean>=>{
    return new Promise((resolve)=>{
        setTimeout(()=>{resolve(true);},time)
    })
}
export const Storage={
    push,find,remove,delay
}
