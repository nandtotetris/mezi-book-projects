const SentryCli = require('@sentry/cli');
const exec = require('child_process').exec;

async function createReleaseOnSentry() {
  const cli = new SentryCli()
  const version = `api:${process.env.DOCKER_CI_COMMIT_SHA}`
  await cli.releases.new(version)
  exec(`./node_modules/.bin/sentry-cli releases set-commits --auto ${version}`)
}

createReleaseOnSentry()