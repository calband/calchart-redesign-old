# CalChart

An attempt at a web-based redesign of Calchart, which integrates the desktop Calchart application, the viewer, and the server.

Goals:
- Create a cloud file system that stores shows created by Stunt and can be viewed by bandsmen
- Create an intuitive UI for charting shows
- Integrate Calchart Viewer
- Integrate the individual continuity generator

## Setup

This project is different from other Comp-Comm projects in that developers will be running the Django server and building the static files locally instead of in a virtual machine (with Vagrant). Each of the steps below will list out the requirements needed to install on a developer's computer.

### Python 3.6

Our Django code is using Python 3.6, which can be downloaded either with Conda or from source.

Conda provides a lot of cool features (we only use a fraction of these features), such as supporting user-wide virtual environments, allowing for different Python versions in each environment, and more.

Recommended install (Conda):
1. Install Conda [here](https://conda.io/miniconda.html) (for Python 3.6)
1. Create a virtual environment: `conda create --name calchart`
1. Activate the environment (needs to be run in every shell): `source activate calchart`
1. See [documentation](https://conda.io/docs/) for more details.

Install from source:
1. Install Python 3.6 [here](https://www.python.org/downloads/)
1. Create a virtual environment: `python3 -m venv venv`
1. Activate the environment (needs to be run in every shell): `source venv/bin/activate`

### PostgreSQL

The Django server uses a PostgreSQL database to save its data, which can either be run locally or using some virtualization software, like Docker. Due to the nature of this requirement, using Docker is highly recommended for development.

"But why use Docker if the whole point was to move away from Vagrant?" Good question. Docker is a lot more lightweight than a full virtual machine, and spinning up a Docker container to start/stop a database is a bit less infrastructure than spinning up a VM that runs a database as well as the Django server. It's a nice separation of concerns, with the virtualization technology just focused on running a database cluster, instead of managing the entire Django backend.

Recommended install (Docker):
1. Install [Docker](https://www.docker.com/get-docker) (Community Edition)
1. Create a PostgreSQL container: `docker create --name calchartdb -e POSTGRES_PASSWORD=calbandgreat -p 5432:5432 postgres`
1. Start the PostgreSQL container: `docker start calchartdb`
    - This can be stopped with `docker stop calchartdb` and started again with the same command.
    - When stopped, the container still resides on your computer. To completely remove it, run `docker rm calchartdb`.
1. See [documentation](https://docs.docker.com/) for more details.

Manual install:
1. Install from the [official site](https://www.postgresql.org/download)
1. Set up the `postgres` database and the `postgres` superuser with the password `calbandgreat`.

### Node.js

Most of the code in this project is written using Vue, a Javascript framework for building client-side applications. In order to run and build this code, developers need to install Node from the [official site](https://nodejs.org/en/download/). For MacOS developers who use Homebrew, `brew install node` should suffice.

After installing Node, run `npm install` to install the dependencies.

### Django

After finishing all the above installation steps, do the following:
1. Install Django requirements (inside the virtual environment): `pip install -r requirements/dev.txt`
1. Set up Django database: `python calchart/manage.py migrate`
1. Create a super user: `python calchart/manage.py shell < scripts/createsuperuser.py`

## Development

First, get the Django server running: `python calchart/manage.py runserver`. Then, in another tab, run `npm run dev`.

You should now be able to connect to `http://localhost:5000`.

## Testing

This project contains four testing facilities:

1. Linting (`npm run lint` and `flake8 calchart/`): Checks code style
2. Server-side tests (`python manage.py test`): These are Django tests that test functionality within the back-end; e.g. testing Django models
3. Unit tests (`npm test`): These are Javascript tests (using the Mocha library) that test functionality within the front-end; e.g. testing Component methods
4. End-to-end tests (`npm run cypress`): These are tests that test functionality between the back-end and front-end; e.g. testing `sendAction` calls.

More detailed information and examples of these tests can be found in `docs/Testing.md`.
