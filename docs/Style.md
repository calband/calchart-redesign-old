# Style

The primary source of style rules is configured in the `.eslintrc` file, which is used for `npm run lint`. Other rules in this file are not configurable in ESLint, so we need to abide by these manually.

## Imports

Imports should be ordered in the following sections separated by newlines:

- Third party libraries
- Calchart imports
- Relative imports

Within each section, order imports with no nested directories first, then alphabetically by path. For example,

```
import $ from 'jquery';
import { has } from 'lodash'; // import individual functions from lodash
import Vue from 'vue';

import router from 'router';
import store from 'store';
import { baz } from 'calchart/bar';
import { abc } from 'calchart/foo';
import quux from 'calchart/foo/quux';
import MyClass from 'calchart/MyClass';
import { stuff } from 'utils/JSUtils'; // import individual functions from utils

import Foo from './foo';
import MyFoo from './myFoo';
```

Generally speaking, always use relative imports for modules in a subdirectory (i.e. no `..` in relative imports). The idea is that a module is self contained; you should be able to move a module to another directory and keep internal imports the same.

## File/code organization

Every file should be in the following format:

```
/**
 * @file A short one-line description of the file.
 *
 * A longer multiple line description of the types, classes, or functions contained
 * in the file.
 */

<imports go here>
```

Class methods should be in the following order:

```
class Foo extends Bar {
    /**
     * @param ...
     */
    constructor(...) { ... }

    // static getters
    static get myFoo() { ... }

    // static methods
    static getFoo() { ... }

    // instance getters
    get myBar() { ... }

    // instance methods
    getBar() { ... }
}
```

With functions ordered alphabetically within each section (by word; e.g. `doFoo` goes before `doesBar`).

## Type documentation

One of the biggest downsides of Javascript is the lack of typing of variables and functions. There are languages such as TypeScript which compile to Javascript but provide typing, but they're rather a pain to learn and use.

Instead of using a language with built-in types, we'll just rely on documenting types really well. Use the following guide to document the codebase (and make a pull request if you see any incorrect styles). The following guide pulls pieces from [JSDoc](http://usejsdoc.org/tags-type.html), Google's [Closure Compiler](https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler#type-expressions), and Facebook's [Flow](https://flow.org/en/docs/types/).

Every function should contain the following docstring:

```
/**
 * A short one-line description of the function (unless it's really obvious).
 *
 * A longer multiple line description of the function if the function is
 * complicated enough to warrant more information. Parameter and return value
 * descriptions should be one-line max. More verbose information should go in
 * this long description.
 *
 * @param {number} x - An optional short description of the parameter
 * @param {string} name
 * @return {boolean} An optional short description of the return value
 */
function foo(x, name) ...
```

Types that could be used in the type documentation:

- Basic types
    - `{number}`: contains ints, floats, and anything else
    - `{string}`
    - `{boolean}`
    - `{undefined}`
    - `{null}`
    - `{void}`: see the function type
    - `{RegExp}`
    - `{Date}`
    - `{Array}`: generic, untyped; prefer the compound array type
    - `{Object}`: generic, untyped: see "Documenting objects"
    - `{Function}`: generic, untyped: prefer the compound function type
    - `{Class}`: a class
    - `{Any}`: generic any type
    - `{A}`, `{B}`, etc.: a specialized `Any`; e.g. `function(A): B` is a function that takes in type `A` and returns type `B`
    - `{MyClass}`: any other class we define can be used
- Compound types
    - `{number[]}` or `{Array<number>}`: an array where each element is a number
    - `{[number, boolean]}`: an array with a fixed length ("tuple" in Javascript)
    - `{number|string}`: union type; either number or string
    - `{?number}`: nullable number
    - `{number} [foo=1]` optional number (defaults to 1)
    - `{function(string, number): void}`: if a function returns void, it shouldn't return anything
    - `{...number}`: accept variable arguments

### Documenting objects

Fun fact: in Javascript, everything is an object. Less fun fact: how do we document objects with defined properties? For example, we might have a function that takes in options as an Object:

```
doFoo(1, 'hello', {
    add: 4,
    capitalize: true,
    append: 'foo',
});
```

Instead of using one of the recommended ways of documenting Objects like this, we're going to document them like this:

```
/**
 * @param {Object} options
 *  | {number} add - An optional short description
 *  | {boolean} capitalize
 *  | {string} append
 */
```

Objects can also be used as a HashMap, where instead of fixed keys, keys/values are stored as a mapping. Document this type like `Object<string: number>`. The key type could be a bit loose; since all keys are cast to `string` anyway, you can use the concept behind the key as the type of the key.

For example, even if an object maps a dot's ID (a string) to a number, you can write the type as `Object<Dot: number>`, since the purpose of the type is to map a (unique identifier of a) Dot to a number.

### Documenting constants

Constants should also be decorated with a short docstring:

```
/**
 * One line description of constant.
 *
 * Optional extended description.
 *
 * @type {number}
 */
const FOO = 1;
```

### Documenting class methods

Class methods should be documented with the same rules as functions. Class getter methods (`static get foo() {}` or `get foo() {}`) should be documented like constants.
