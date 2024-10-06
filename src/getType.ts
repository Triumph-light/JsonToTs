import JSON5 from 'json5';
import prettier from 'prettier';
import { getBigCamelName, getType, isArray, isObject } from './utils';
import { window } from 'vscode';

type KV = Record<string | number | symbol, unknown>;
/**
 * 获取json类型
 * @param jsonString json字符串
 * @param space 自定义缩进
 * @returns typescript类型
 */
export default async function (jsonString: string, space = '    ') {
    /**
     * 遍历节点
     * @param node 节点
     * @param propsName 节点名称
     * @param level 当前层级, 用来控制缩进
     */
    function generateTs(node: unknown, propsName?: string, parentType?: string, level = 0): string {
        const indent = space.repeat(level);
        // 对象
        if (isObject(node)) {
            const innerTypeArr = [];
            innerTypeArr.push('{');
            for (const key in node) {
                innerTypeArr.push(generateTs(node[key], key, 'object', level + 1));
            }
            innerTypeArr.push('}');

            // 类型如果被抽出处理就需要更改返回值，如果没处理就不需要更改
            if(propsName && level > 0) {
                const camelName = getBigCamelName(propsName);
                // 存储生成的类型对象
                const topType = `type ${camelName} = ${innerTypeArr.join('')}`;
                topTypeScope.push(topType);
                topTypeScope.push(';');
                return `${indent}${propsName}: ${camelName};`;
            }else {
                return `${innerTypeArr.join('')}`;
            }
        }
        // 数组
        else if (isArray(node)) {
            // true就是数组
            // false就是元组
            let isAllSameChildNode = true;
            let prevNode;
            for (let currentNode of node) {
                if (void 0 !== prevNode) {
                    isAllSameChildNode = isSameScheme(prevNode, currentNode);
                    if (!isAllSameChildNode) {
                        break;
                    }
                }
                prevNode = currentNode;
            }

            const innerTypeArr = [];
            innerTypeArr.push('[');
            // 所有元素相同, 数组
            // 结构: xxx[]
            if (isAllSameChildNode) {
                const sameType = generateTs(node[0], '', 'array', level + 1);

                if(isObject(node[0]) && propsName){
                    const camelName = getBigCamelName(propsName);
                    const topType = `type ${camelName}Item = ${sameType}`;
                    topTypeScope.push(topType);
                    topTypeScope.push(';');
                    innerTypeArr.unshift(`${camelName}Item`);
                }else {
                    innerTypeArr.unshift(sameType);
                }
            }
            
            // 元组
            // 结构: [xxx, yyy]
            else {
                for (let childNode of node) {
                    innerTypeArr.push(generateTs(childNode, void 0, 'array', level + 1));
                    innerTypeArr.push(`,`);
                }
                // 删除尾部","
                innerTypeArr.pop();
            }
            innerTypeArr.push('];');
            return propsName ? `${indent}${propsName}: ${innerTypeArr.join('')}` : `${innerTypeArr.join('')}`;
        }
        // 简单类型
        else {
            const type = typeof node;
            return propsName ? `${indent}${propsName}: ${type}` + ('array' === parentType ? '' : ';') : `${indent}${type}`;
        }
    }

    let json = jsonString;
    try {
        json = JSON5.parse(json);
    } catch (error: any) {
        console.error('---------error', error,error.message,error.stack);
        window.showErrorMessage('json数据格式错误');
        return Promise.reject(new Error(error));
    }
    const typeArray: string[] = [`type ResponseData=`];
    // 记录顶层的ts类型
    const topTypeScope: string[] = [];
    typeArray.push(generateTs(json));

    const typeString = [...topTypeScope,...typeArray].join('');
    
    return prettier.format(typeString, { parser: 'typescript'});
}

export function isSameScheme(input1: unknown, input2: unknown) {
    const type = [getType(input1), getType(input2)];

    if(type[0] !== type[1]) {return false;}

    // 类型相同,
    // 继续判断引用类型的值
    if ('object' === type[0]) {
        const obj1 = input1 as KV;
        const obj2 = input2 as KV;
        const isSameKeysLength = Object.keys(obj1).length === Object.keys(obj2).length;

        // 键值数量不同
        if (!isSameKeysLength) {return false;}

        // 键值数量相同
        // 判断值的类型是否相同
        for (const key in obj1) {
            // 有不同的键值
            if (void 0 === obj2[key]) {
                return false;
            }
            // 判断值的类型是否相同
            else if (!isSameScheme(obj1[key], obj2[key])) {
                return false;
            }
        }
        return true;
    } else if ('array' === type[0]) {
        const length1 = type[0].length;
        const length2 = type[1].length;

        if (length1 !== length2) {return false;}

        const length = Math.max(length1, length2);
        for (let i = 0; i < length; i++) {
            const isSame = isSameScheme((input1 as unknown[])[i], (input2 as unknown[])[i]);
            if (!isSame) {
                return false;
            }
        }
        return true;
    } else {
        return true;
    }
}


