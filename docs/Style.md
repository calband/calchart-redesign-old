Calchart Style
==============

The main part of this project is written in Javascript. Javascript is itself an implementation of ECMAScript, which defines the data structures, functions, and other specifications that need to be implemented by languages if they want to be considered compatible with ECMAScript.

The newest specification of ECMAScript is ECMAScript 2015 (also ES2015 or ES6, for the 6th edition of ECMAScript). However, not all browsers have ES6 implemented, so we compile our code with Babel, which converts ES6 code into ES5 code, which is sufficient for most modern browsers.

This file provides a brief overview of ES6 features, as well as some style decisions that should be kept consistent across the project.

## Intro to ES6

When writing ES6, it might be helpful to think in terms of Python, with regards to coding paradigms.

### Functions

- ES6

```js
function foo(a, b=1) {
    let c = a + b;
    return c;
}

console.log(foo(2)); // 3
console.log(foo(3, 4)); // 7
```

- Python

```python
def foo(a, b=1):
    c = a + b
    return c

print(foo(2)) # 3
print(foo(3, 4)) # 7
```

Note: you might have seen Javascript code use `var`. ES6 introduced `let`, which is block scoped. For example,

```js
// with var
if (foo) {
    var x = 0;
} else {
    var x = 1;
}
console.log(x); // works

// with let
if (foo) {
    let x = 0;
} else {
    let x = 1;
}
console.log(x); // ReferenceError

let x;
if (foo) {
    x = 0;
} else {
    x = 1;
}
console.log(x); // works
```

### OOP

- ES6

```js
class Parent {
    constructor(a) {
        this._a = a;
    }

    static get name() {
        return "Parent";
    }

    foo(x) {
        return this._a + x;
    }
}
class Child extends Parent {
    constructor(a, b) {
        super(a);
        this._b = b;
    }

    static get name() {
        return "Child";
    }

    static create(a, b) {
        return new this(a, b);
    }

    get b() {
        return this._b;
    }

    foo(x) {
        return super.foo(x) + this._b;
    }
}

c1 = new Child(1, 2);
c2 = Child.create(1, 2); // same as c1
console.log(Parent.name); // Parent
console.log(Child.name); // Child
console.log(c1.constructor.name); // Child
console.log(c1.b); // 2
console.log(c2.foo(3)) // 6
```

- Python

```python
class Parent:
    name = 'Parent' # except unchangeable

    def __init__(self, a):
        self._a = a

    def foo(self, x):
        return self._a + x

class Child(Parent):
    name = 'Child' # except unchangeable

    def __init__(self, a, b):
        super().__init__(a)
        self._b = b

    @classmethod
    def create(cls, a, b):
        return cls(a, b)

    @property
    def b(self):
        return self._b

    def foo(self, x):
        return super().foo(x) + self._b

c1 = Child(1, 2)
c2 = Child.create(1, 2)
print(Parent.name) # Parent
print(Child.name) # Child
print(c1.name) # Child
print(c1.b) # 2
print(c2.foo(3)) # 6
```

- Privacy

In Javascript, everything is an object, meaning that there are no public/private fields. However, similar to Python, there are some developer-enforced rules to simulate a true OOP paradigm. There might be some exceptions scattered throughout the project, but try to be consistent with the rest of the codebase.

1. Never access a field prefixed with an underscore except from `this`. Underscore-prefixed fields represent private fields that only a class and its subclasses can see.

```
class A {
    constructor() {
        this._a = 1;
    }
    foo() {
        // good
        return this._a;
    }
}

class B extends A {
    foo() {
        // good
        return this._a + 1;
    }
}

// bad
new B()._a;
```

2. Use read-only getters (`get foo() {}`) if the field is not expected to change after creating the object. Use explicit getters (`getFoo() {}`) if calculations are involved or if the field is something that can be modified with some action by the user. For example, `ApplicationController` has a read-only getter for `show`, since a show will not change after being opened by the application. On the other hand, `Show` has an explicit `getSheets` because the sheets in a show is expected to change in the normal usage of the editor.

3. If a class exposes a read-only getter, subclasses should use the read-only getter unless they need to modify the field.

```
class A {
    constructor() { this._a = 1; }
    get a() { return this._a; }
}
class B extends A {
    foo() {
        return this.a + 1;
    }
    setA(a) {
        this._a = a;
    }
}
```

### Modules

- ES6

```js
// foo.js
export default class Foo {}

// bar.js
export function foo() {}
export function bar() {}

// baz.js
export const BAZ = 1;

// main.js
import Foo from "./foo";
import * as Bar from "./bar";
import { BAZ } from "./baz";

new Foo();
Bar.foo();
BAZ;
```

- Python

```python
# foo.py
class Foo:
    pass

# bar.py
def foo():
    pass
def bar():
    pass

# baz.py
BAZ = 1

# main.py
from foo import Foo
import bar as Bar
from baz import BAZ
```

### Miscellaneous ES6 Features

- Arrow functions: Syntactic sugar for function callbacks. One advantage for using arrow functions (other than readability) is that `this` is set to the `this` outside of the function.

```js
[1,2].map(x => x + 1); // [2,3]

[1,2].forEach((x, i) => {
    console.log(x); // 1 then 2
    console.log(i); // 0 then 1
});

class Foo {
    foo1() {
        [1,2].forEach(function(x) {
            this // undefined
        });
    }

    foo2() {
        [1,2].forEach(x => {
            this // Foo instance
        });
    }
}
```

- String interpolation: Syntactic sugar for creating strings.

```js
let x = 1;
let s1 = `x is currently: ${x}`;
let s2 = "x is currently: " + x;
s1 === s2;
```

- Pattern Matching: Syntactic sugar for extracting data.

```js
let arr = [1,2];
let o = { a: 1, b: 2 };

let [x, y] = arr;
x === arr[0];
y === arr[1];

let {a, b} = o;
a === o.a;
b === o.b;
```

- for...of: Syntactic sugar for iterating through values of arrays.

```js
for (let i in ["a", "b", "c"]) {
    console.log(i); // 0 1 2
}
for (let s of ["a", "b", "c"]) {
    console.log(s); // a b c
}
```

### External Packages/Libraries

All external libraries are loaded in `base.html` and can be used everywhere.

- jQuery: To load jQuery, do the following:

```js
import "utils/jquery";

$("h1").text("Hello world!");
```

This will add all of our custom jQuery functions (see `utils/jquery.js`) to the jQuery library. Note: with most jQuery operations, don't use arrow functions, since arrow functions define `this` as the containing object, when you probably need `this` to refer to the DOM object:

```js
class Foo {
    foo1() {
        $("h1").each(() => {
            this // refers to Foo instance
        });
    }

    foo2() {
        $("h1").each(function() {
            this // refers to <h1> DOM element
        });
    }
}
```

- D3: [D3](https://d3js.org) is used to draw the dots and the field.

- lodash: [lodash](https://lodash.com/docs/4.17.4) is a library with tons of helpful utility functions. Check this library before adding functions to `JSUtils`.

```js
_.last([1, 2]); // 2

let o = { a: 1, b: 2 };
_.mapKeys(o, (v, k) => v + k);
console.log(o); // { a1: 1, b2: 2 }
```

Some helpful functions:

- `_.each(Object, Function(value, key))`: Runs a function for each value/key in the object.
- `_.defaults(Object, Object)`: Any `undefined` value in the first object is set to the value in the second object.
- `_.defaultTo(val, default)`: If `val` is `undefined`, `null`, or `NaN`, return `default`, otherwise `val`.

## Style

### Imports

When importing, use the full path to import, instead of relative paths:

```js
// no
import Dot from "./Dot";

// yes
import Dot from "calchart/Dot";
```

Imports should be organized in two sections, one for utilities and one for all other modules. Within each section, order imports alphabetically by **path**.

```js
import AnimationState from "calchart/AnimationState";
import Grapher from "calchart/Grapher";
import EditorController from "editor/EditorController";

import HTMLBuilder from "utils/HTMLBuilder";
import { empty } from "utils/JSUtils";
```

### Checking type

Use the lodash package for checking types.

```js
// no
x === undefined;
x === null;
typeof x === "function";
typeof x === "number";

// yes
_.isUndefined(x);
_.isNull(x);
_.isFunction(x);
_.isNumber(x);
```

### Documentation

Use the same syntax as [JSDoc](http://usejsdoc.org/) when documenting code. Examples:

```js
/**
 * Overall explanation for the class
 */
export default class Foo {
    /**
     * @param {int} x - A short description of x.
     */
    constructor(x) {...}

    /**
     * @param {string[]} arr - Parameters don't have to have descriptions, if it doesn't need
     *   explanation. The next parameter doesn't have a description because "useBar" is pretty
     *   self-explanatory.
     * @param {boolean} useBar
     * @return {Object} This description can be omitted if the function name is descriptive enough.
     */
    bar(arr, useBar) {...}

    /**
     * @param {(string|number)} val - This parameter can be either a string or a number.
     * @param {string} [s] - This parameter is optional, with no default.
     * @param {boolean} [isNext=true] - This parameter is optional, with a default.
     * @return {?int} This type can be either int or null.
     */
    baz(val, s, isNext=true) {...}
}
```

Notes:
- Write function documentation as commands, instead of descriptions; e.g. "Get the given dot" instead of "Gets the given dot".
- Write docs in full sentences, with a period at the end.
- You don't have to redocument inherited functions from super classes, unless some parameters have different meanings or properties (e.g. documenting function options).
- Use `number` if the given value can be either an `int` or a `float`.
