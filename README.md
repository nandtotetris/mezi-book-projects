# Installation

Dependencies:

- node (npm/yarn)
- docker
- docker-compose
- docker registry (registry.gitlab.com)
- git repository (gitlab.com)

## Production installation

Best way to see how backend application is deploy into producion, see following files:
* `.gitliab-ci.yml`
* `docker-compose.yml`
* `bin/docker-deploy.sh`

## Local installation

### Requirements

* bash (or equivalent terminal)
* docker
* docker-compose
* traefik

### Environnements variables

```bash
cp .env.dist .env
```

Edit .env file to set properly values of variables:
* APP_CONFIG_FILE
* DOMAIN
* GID
* REACT_APP_API_URL
* UID

### Build application

You can build project with natif nodejs. Also, you can use container as follow: 

Requirements:
* Docker
* `~/.yarnrc`, `~/.yarn/` and `~/.cache/yarn/` have to exist.

1. Build application:
    ```bash
    docker run --rm -it --read-only \
      --entrypoint /bin/sh \
      --user 1000:1000 \
      -v $(pwd):/workspace \
      -v ~/.cache/yarn/:/home/node/.cache/yarn/ \
      -v /tmp/:/tmp \
      -v ~/.yarn/:/home/node/.yarn/ \
      -v ~/.yarnrc:/home/node/.yarnrc \
      -w /workspace \
      node:11-alpine -c "yarn workspaces run install --frozen-lockfile"
    docker run --rm -it --read-only \
      --entrypoint /bin/sh \
      --user 1000:1000 \
      -v $(pwd):/workspace \
      -v ~/.cache/yarn/:/home/node/.cache/yarn/ \
      -v /tmp/:/tmp \
      -v ~/.yarn/:/home/node/.yarn/ \
      -w /workspace \
      node:11-alpine -c "yarn workspaces run build"
    ```
2. Build Docker image
    ```bash
    docker-compose build
    ```

### Setup docker-compose

`docker-compose.yml` is production docker-compose file but locally, you will need additionnal configuration.

NOTE: below, we use symlic for `docker-compose.override.yml`. If you need to change targeted file, use command `unlink docker-compose.override.yml` then recreate symlik as describe as below.

#### Production like deployment

To run production like deployment, you need a database which is defined into `docker-compose.prod-local.yml`.
To use it:

```
ln -s docker-compose.prod-local.yml  docker-compose.override.yml
docker-compose-up
```

Access to backend application:
* http://api.${DOMAIN}/graphql
* http://app.${DOMAIN}/graphql

`DOMAIN` should be defined into .env

#### Development deployment

To run developpement deployment, you need the configuration defined into `docker-compose.dev.yml`.
To use it:

```
ln -s docker-compose.dev.yml  docker-compose.override.yml
docker-compose-up
```

Access to backend application:
* http://api.${DOMAIN}/graphql
* http://app.${DOMAIN}/

Or via direct port:
* http://localhost:9000/grapqhl  
  Be aware about `REACT_APP_API_URL` value into .env. It has to be `http://localhost:9000/graphql`.
* http://localhost:3000 


#### Traefik

To deploy traefik, see: https://gitlab.com/backend/traefik

If you dont use traefik, you will need to create manually a docker network as follow;

``` bash
docker network create traefik_net
```

## Connect to private Docker registry

You need to [login to the docker registry](https://docs.docker.com/engine/reference/commandline/login/) of Backend `registry.gitlab.com/backend/docker-images/`. Run:

``` bash
docker login registry.gitlab.com -u GITLAB_USERNAME -p GITLAB_PASSWORD
```

## Run

Run:

``` bash
yarn up
```

For clean docker resources:

``` bash
yarn down
```

## Upload files

Option dotEnv = `STORAGE_MODE=local` OR `STORAGE_MODE=s3`

## Debugger

Run the server in debug mode:

- `yarn workspace backend run debug`

In VSCode, on the left toolbar click the spider 🕷. On the top of the left panel, select Attach in the dropdown, then click the green play ▶️ button. You can now set breakpoints or a `debugger` statement.

## Configure Runner bastion

- Get permission file
- Connect to bastion :
`ssh -i "gitlab_runner.pem" ubuntu@ec2-34-243-245-184.eu-west-1.compute.amazonaws.com`
- Edit config file
`sudo vim /etc/gitlab-runner/config.toml`
- Restart bastion
`sudo -i gitlab-runner restart`
