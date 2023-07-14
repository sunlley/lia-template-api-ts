export const CONTROLLER_METADATA = 'controller';
export function Controller(path = ''): ClassDecorator {
    return (target: object) => {
        // console.log('Controller',target.constructor.name)
        Reflect.defineMetadata(CONTROLLER_METADATA, path, target);
    };
}
