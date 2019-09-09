const SentryCli = require('@sentry/cli');
const { version } = require('./package.json');

async function uploadSourceMaps() {
  //default config file is read from ~/.sentryclirc
  const cli = new SentryCli();

  // const releaseVersion = await cli.releases.proposeVersion();
  console.log('Proposed version:\n', version);

  const options = {
    debug: false,
    include: ['./build/'],
    urlPrefix: '~',
    rewrite: true,
    ignore: ['node_modules']
  };

  console.log('upload options:\n', options);

  // await cli.execute(['releases', 'delete', version, 'A']);
  await cli.releases.new(version);
  await cli.releases.uploadSourceMaps(version, options);
  await cli.releases.finalize(version);
}

uploadSourceMaps();
