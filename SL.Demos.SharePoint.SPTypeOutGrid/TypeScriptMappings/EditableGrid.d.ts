/// <reference path='../TypeScriptMappings/knockout.d.ts' />

interface KnockoutObservableFunctions<T> {
    beginEdit(args: any): any;
}

interface KnockoutExtenders {
    editable(target: any, option: any): any;
}

interface Function {
    createDelegate(obj: any, obj1: any);
    createDelegate(obj: any, obj1: any, obj2: any, obj3: any);
}