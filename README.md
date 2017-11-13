# CalChart

An attempt at a web-based redesign of Calchart, which integrates the desktop Calchart application, the viewer, and the server.

Goals:
- Create a cloud file system that stores shows created by Stunt and can be viewed by bandsmen
- Create an intuitive UI for charting shows
- Integrate Calchart Viewer
- Integrate the individual continuity generator

## Setup

1. Install Virtualbox and Vagrant
2. Install [Node 6.x](https://nodejs.org/en/download/) (MacOS: `brew install node@6`)
3. Clone the repo
4. `vagrant up`: This will setup a VM that will be installed with all dependencies needed for this project
5. Create a `.env` file in the top-level directory
6. `npm install` (on your local machine)

## Development

First, get the Django server running: `vagrant ssh -c "python manage.py runserver"`. Then, in another tab, run `npm run dev`.

You should now be able to connect to `http://localhost:5000`.

## Testing

This project contains four testing facilities:

1. Linting (`npm run lint` and `flake8 calchart/`): Checks code style
2. Server-side tests (`python manage.py test`): These are Django tests that test functionality within the back-end; e.g. testing Django models
3. Unit tests (`npm test`): These are Javascript tests (using the Mocha library) that test functionality within the front-end; e.g. testing Component methods
4. End-to-end tests (`npm run e2e`): These are tests that test functionality between the back-end and front-end; e.g. testing `sendAction` calls.

More detailed information and examples of these tests can be found in `docs/Testing.md`.
