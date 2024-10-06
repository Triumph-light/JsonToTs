type KV = Record<string | number | symbol, unknown>;

export function isObject(node: unknown): node is KV {
    return '[object Object]' === Object.prototype.toString.call(node);
}

export function isArray(node: unknown): node is unknown[] {
    return '[object Array]' === Object.prototype.toString.call(node);
}

export function getType(node: unknown): string {
    const type = typeof node;

    if(type === 'object'){
        if(isArray(node)) {return 'array';}
        else if(node === null) {return 'null';}
        else {return 'object';}
    }else {
        return type;
    }
}

export function isSnakeCase(propsName: string): boolean {
    const snakeCaseRegex = /^[a-z]+(_[a-z]+)*$/;
    return snakeCaseRegex.test(propsName);
}


export function getBigCamelName(propsName: string | undefined): string{
    if(!propsName) {return '';}
    if(isSnakeCase(propsName)) {
        return propsName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
        .join(''); 
    }
    return `${propsName.slice(0,1).toUpperCase()}${propsName.slice(1)}`;
}

