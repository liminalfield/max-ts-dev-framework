// types/max.ts
export {}; // Makes this a module so "declare global" works

declare global {
    let autowatch: number;
    let inlets: number;
    let inlet: number;
    let outlets: number;

    const jsarguments: string[];
    const messagename: string;

    function outlet(index: number, ...args: any[]): void;
    function post(...args: any[]): void;
    function error(...args: any[]): void;
    function messnamed(name: string, ...args: any[]): void;
    function arrayfromargs(...args: any[]): any[];
    function include(path: string): void;

    class Folder {
        constructor(path: string);
        end: boolean;
        filename: string;
        next(): void;
        close(): void;
    }

    class Dict {
        constructor(name?: string);
        name: string;
        get(key: string): any;
        set(key: string, value: any): void;
        replace(key: string, value: any): void;
        getkeys(): string[];
    }

    class LiveAPI {
        constructor(pathOrFunction: string | (() => void), idOrPath?: number | string);
        path: string;
        id: number;
        mode: number;
        call(method: string, ...args: any[]): any;
        get(path: string): any;
        set(path: string, value: any): void;
        observe(path: string): void;
        unobserve(path: string): void;
        getcount(property: string): number;
    }

    class Task {
        constructor(callback: () => void, ...args: any[]);
        interval: number;
        repeat: number;
        cancel(): void;
        schedule(delay?: number): void;
    }

    class Global {
        constructor(name: string);
        name: string;
        sendnamed(messageName: string, ...args: any[]): void;
    }
}
