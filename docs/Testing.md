# Testing

This project employs both a Django backend in Python and a Vue frontend in Javascript. Extensive testing is necessary to ensure that the various components of the project work well separately so that we are fairly confident that our application works when put together.

Whenever adding a new feature or fixing bug, there should almost always be a corresponding test that tests the correctness of the feature/bug. If a bug, that test should break before the fix and succeed after the fix.

## Linting

Linting is the process of standardizing the code style across all files. This is especially important in a project with multiple people working on it, each with a different coding style. We have two linters, one for the Python and one for the Javascript, that are configured to check for good/bad coding style.

We use [`flake8`](http://flake8.pycqa.org/en/latest/) for linting the Python code. `flake8` is meant to be pluggable, so we also include various `flake8` plugins that are listed in `requirements/dev.txt`. Configuration occurs in the `setup.cfg` file.

```
$ flake8 calchart/
```

We use [`eslint`](https://eslint.org/) and [`eslint-plugin-vue`](https://github.com/vuejs/eslint-plugin-vue) for linting the Javascript/Vue code. `eslint` is super configurable; everything we're checking is listed in `.eslintrc.json`. Anything not on the list is checked, so if you want something else to be linted, add it to `.eslintrc.json`.

```
$ npm run lint
```

## Server-Side Tests

These tests are Django tests that test functionality within the back-end; for example, testing models or POST actions. The tests should be written in `calchart/tests/`, with a separate file per Calchart page (e.g. `test_home`, `test_editor`).

Tests should test non-trivial functionality. For example, we should not check that doing `MyModel.objects.create(...)` creates a `MyModel` with the given fields; Django already guarantees that with its ORM functionality. What we could do is check any side effects we added to `.create()` or something.

```
$ python calchart/manage.py test
```

## Unit Tests

These tests are Javascript tests that test functionality within the front-end; for example, testing Component methods, or testing if an HTML element is hidden when its `v-if` attribute is `false`. We use the [Mocha](https://mochajs.org/) library to run tests, along with the [vue-test-utils](https://vue-test-utils.vuejs.org/en/) package for utilities testing Vue components.

These tests should be written in the `test/` directory, following the same layout as the `vue_src` directory. For example, testing the `vue_src/home/ShowList.vue` component should be done in the file `test/home/ShowList.spec.js`.

```
$ npm test
```

## End-to-End Tests

These tests test functionality between the backend and frontend; for example, testing that actions from the frontend being sent to the backend have the correct events occur. Think of these tests as automating user experiences, steps a developer might run manually to check that a given sequence of actions works (e.g. text in box, click button, click other button that appears, etc).

We use the [`cypress`](https://www.cypress.io) library to write tests. Tests should be written in the `cypress/` directory.

```
$ npm run cypress
```

You should also be running `npm run dev` when running end-to-end tests.
