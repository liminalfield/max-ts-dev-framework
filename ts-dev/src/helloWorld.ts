
function hello() {
    post("Hello World! This is a mostly empty function\n");

}


(globalThis as any).hello = hello;