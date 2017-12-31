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
