// @build bundle

import { getGreeting } from "./utils/greeter";

autowatch = 1;

function hello(): void {
    const message = getGreeting("Max");
    post(message);
}

(globalThis as any).hello = hello;
