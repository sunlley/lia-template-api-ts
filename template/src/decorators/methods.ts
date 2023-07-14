import {HttpMethod} from "../types/types";

export const ROUTE_METADATA = 'method';
export function CallLog(
    target: Object,
    propertyName: string,
    propertyDescriptor: PropertyDescriptor): PropertyDescriptor {

    const method = propertyDescriptor.value;

    propertyDescriptor.value = function (...args: any[]) {
        console.log(`Call [${propertyName}] Start`,'Args',args);
        const params = args;
        const result = method.apply(this, args);
        return result;

    }
    return propertyDescriptor;
}
function create_assert_params(keys: any,assert?:string) {
    return (
        target: Object,
        propertyName: string,
        propertyDescriptor: PropertyDescriptor): PropertyDescriptor =>{
        const method = propertyDescriptor.value;
        propertyDescriptor.value = function (...args: any[]) {
            // console.log(`Call [${propertyName}] Start`,'target',target);
            // console.log(`Call [${propertyName}] Start`,'Args[0]',args[0]);
            // console.log(`Call [${propertyName}] Start`,'keys',keys);
            // @ts-ignore
            target[assert?assert:'assertParams'](args[0],keys)
            const result = method.apply(this, args);
            return result;
        }
        return propertyDescriptor;
    }
}

export function createMethodDecorator(method: HttpMethod = 'get') {
    // @ts-ignore
    return (path = ''): MethodDecorator => (target: any, name: string, descriptor: any) => {
            Reflect.defineMetadata(
                ROUTE_METADATA,
                { type: method, path },
                descriptor.value,
            );
        };
}

export const AssertParams=create_assert_params;

export const Get = createMethodDecorator('get');
export const Post = createMethodDecorator('post');
