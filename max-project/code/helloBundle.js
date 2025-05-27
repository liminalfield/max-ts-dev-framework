"use strict";
(() => {
  // src/utils/greeter.ts
  function getGreeting(name = "World") {
    return `Hello ${name}! This greeting came from an imported module.
`;
  }

  // src/helloBundle.ts
  autowatch = 1;
  function hello() {
    const message = getGreeting("Max");
    post(message);
  }
  globalThis.hello = hello;
})();
