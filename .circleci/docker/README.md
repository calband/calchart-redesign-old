# Docker

These files define a Docker image used by Circle CI to run tests, since we require both Node and Python to be installed on the test machine.

## Build

To build the image, `cd` into this directory and run `docker build -t calband/circleci-calchart:VERSION .`.

This will build the Docker image according to the Dockerfile and tag it as `calband/circleci-calchart:VERSION`. Update the version whenever you change the Dockerfile.

## Test

To test the image locally, start a container with `docker create -t --name calchart calband/circleci-calchart:VERSION`. This will create a container with the name "calchart". Then run `docker start calchart` to start the container. Then you can run `docker exec -it calchart /bin/bash`, which will execute a bash shell in the Docker container for you to experiment with.

Run `docker stop calchart` to stop the container. You can then run `docker rm calchart` to remove the container.

## Deploy

To push the Docker image to the repository for Circle CI to use, run `docker push calband/circleci-calchart:VERSION`.
