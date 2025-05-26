# Max/MSP & Max for Live TypeScript Dev Framework

This repository provides a dev framework for developing projects with Cycling 74's Max and Ableton's Max for Live tools using TypeScript. It enables developers to write modern TypeScript code for Max’s JavaScript runtime (the v8 object), and streamline the build and deployment process.

This README provides an overview of the project structure, setup instructions, build workflow, and guidance for using the framework.

## Project Structure
The repository is organized into two primary folders, separating the Max project from the TypeScript development environment:

```
max-ts-dev-framework/
├── max-project/ 
│ ├── code/ 
│ └── patchers/ 
│ 
├── ts-dev/ 
│ ├── dist/ (not included in the git repo) 
│ ├── node_modules/ (not included in the git repo) 
│ ├── scripts/ 
│ ├── src/ 
│ └── types/ 
│ 
├── package.json 
├── package-lock.json 
├── tsconfig.json 
└── .gitignore
```


By structuring the project this way, you keep the Max-facing files (max-project) separate from the development files. The Max user (or Ableton Live user, in the case of M4L devices) will primarily interact with the max-project folder (e.g., loading the Max Project or device), while as a developer you will mostly work in ts-dev during development.

### max-project
`max-project/`
- A standard Max project folder, containing everything needed to load and run the project in Max.
- This is just a regular project folder, so other standard Max project files can be placed here as needed, e.g., media/, externals/ if required.)

`max-project/code/`
- JavaScript code for Max, copied from the TypeScript build output. This will include files like `helloWorld.js` (generated from TypeScript) that the Max patcher uses.

`max-project/patchers/`
- Max patcher files (`.maxpat`). For example, `hello.maxpat` is a patch containing a v8 object referencing the `helloWorld.js` script


### ts-dev/
- The TypeScript development environment (not included in the Max project itself, but used during development)

`ts-dev/src/`
- Source TypeScript code
- Developers write their Max scripting logic here in `.ts` files

`ts-dev/dist/`
- Compiled JavaScript output.
- The build process transpiles `.ts` files into this directory as `.js` files. These files are what get copied into `max-project/code/`.

`ts-dev/types/`
- Custom TypeScript declaration files (`.d.ts`).
- Currently includes `max.d.ts` with basic type definitions for the Max environment. This provides rudimentary typings for functions and objects provided by Max’s JS API (e.g., `post()`, `outlet()`, etc.). The provided definitions are minimal, but they allow for some type checking and IntelliSense. (Developers can expand or replace these as needed; see Extending Type Definitions below.)

`ts-dev/scripts/`
- Build and utility scripts
- `build.js` – Compiles the TypeScript source to JavaScript (essentially invoking the TypeScript compiler with the project’s `tsconfig.json`).
- `copy-to-max.js` – Copies the compiled JavaScript files from `dist/` into the Max project’s `code/` directory. This script has a manual list of files to copy; by default it will include the example `helloWorld.js`. Note: If you add new source files, you must update this script to copy them over after build.

`ts-dev/package.json`
- Node package configuration, including dependencies and npm scripts. Notably, it defines the npm run build script which runs the two-step build process (compile TypeScript, then copy outputs to `max-project`). It also lists any Node packages you install for use in your Max code (Node for Max allows using many npm modules in the patch).

`ts-dev/tsconfig.json`
- Preconfigured TypeScript compiler options. It is set up to target an appropriate JavaScript version for Max’s v8 engine and to find type definitions in the types/ folder. It will compile source from `src/` to output in `dist/` with the same file names.

## Getting Started
Follow these steps to set up and use the framework for your own project:
1. Clone or Use as Template: Download this repository or click "Use this template" on GitHub to create a new project repository based on it. This will give you the entire structured framework.
2. Install Dependencies: Open a terminal in the `ts-dev` directory and run `npm install`. This will install the TypeScript compiler and any other npm packages required (if any). The `node_modules/` folder will be created in `ts-dev` (it is excluded from git).
3. Open the Max Project: In Max (or Ableton Live’s Max for Live), open the `max-project` folder as a project, or open the provided `hello.maxpat` patcher inside `max-project/patchers/`. This patch is an example that uses the built JavaScript file via a v8 object. The v8 object is already pointing to `code/helloWorld.js` and has autowatch enabled for live reloading
4. Build the TypeScript Code: During development, write your code in TypeScript files under `ts-dev/src/` (you can use your preferred editor or IDE; the project is editor-agnostic). When ready to test in Max, run the build script `npm run build`. This command (defined in `package.json`) will:
    - Compile TypeScript to JavaScript – using `ts-dev/scripts/build.js`, which invokes the TypeScript compiler according to `tsconfig.json`, outputting .js files to `ts-dev/dist/`.
    - Copy files to Max project – using `ts-dev/scripts/copy-to-max.js`, which takes the compiled .js files from `dist/` and copies them into `max-project/code/`. By default, it copies the files explicitly listed in the script (e.g., `helloWorld.js`). If you add new source files, make sure to update this list.
5. Test in Max: After running the build, switch to Max. If you have the example patch open (or your own patch referencing the script files), Max will automatically reload the updated JavaScript (thanks to autowatch in the patcher). You can then trigger the Max patch (e.g., click the bang button in `hello.maxpat`) to execute your code. The example `helloWorld.js` should print a greeting to the Max console or perform whatever logic you defined.
6. Iterate: During development, repeat the edit→build→test cycle. Each time you run `npm run build`, the latest .js output is placed into the Max project. You can leave the Max patch open; with autowatch, the script updates live. This allows for a smooth workflow where you write TypeScript, build, and immediately see the effect in Max.

Tip: You may integrate this build command into your IDE or editor. For instance, the project author uses a WebStorm run configuration or toolbar button to execute `npm run build` with one click for convenience. You could also set up a watcher to run the build on file changes, although that is not configured by default.


## Planned Improvements
This framework is in its early stages, and there are several known limitations and potential improvements on the roadmap:

- Streamlining file deployment: Currently, the `copy-to-max.js` script requires manual listing of each file to copy. This is error-prone if you forget to add a new file. A future update may include a more dynamic solution – for example, maintaining a YAML/JSON configuration file that lists the output files to deploy, or simply copying all .js files from `dist/` by default. This would make the build process more scalable and convenient.

- Expanded Max API Type Definitions: The included TypeScript definitions for Max are very minimal. We plan to expand these as the framework matures, or incorporate existing type definitions from the community. Integrating a complete definition (such as those available in the DefinitelyTyped project) would provide comprehensive IntelliSense and compile-time checking for the Max API

- Tooling and Workflow: Additional scripting could improve development workflow – for example, adding a watch mode (npm run watch) to auto-build on file changes, or integrating with Max’s scripting notifications to trigger builds. Also, providing template code for common tasks (like a basic Max for Live device structure) could be considered.

- Documentation and Examples: While this README serves as an initial guide, more examples and perhaps a wiki or tutorial videos could be added to help new users. Future documentation might include recipes for common patterns (e.g., handling Max timing, using the Live API with TypeScript, etc.).

Feedback and contributions on these improvements are welcome. If you have ideas or find issues, feel free to open an issue or pull request on the repository. Since there is no strict contributing guide, you can also reach out to the maintainer directly for significant suggestions or questions.


## License
This project is licensed under the Apache License 2.0, which allows you to use, modify, and distribute the framework in your own projects. See the LICENSE file for details. You are free to incorporate this starter framework into commercial or open-source projects, provided you adhere to the license terms (primarily preserving the license notice and limitations of liability).


---

Happy hacking with Max and TypeScript! By leveraging this framework, we hope you can focus on creative coding in Max/MSP and Max for Live, with the confidence and convenience of TypeScript at your side. Enjoy building expressive audio/visual projects with a robust typed codebase!
