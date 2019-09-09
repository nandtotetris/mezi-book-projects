const getHeaders = () => {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', document.location, false);
    req.send(null);
    let headers = req.getAllResponseHeaders().toLowerCase();
    headers = headers.split(/\n|\r|\r\n/g).reduce(function(a, b) {
        if (b.length) {
            const [ key, value ] = b.split(': ');
            a[key] = value;
        }
        return a;
    }, {});
    resolve(headers);
  });
}

export default {
  domain: async () => {
    const headers = await getHeaders();
    const domain = headers['x-api-url'] || 'http://localhost:9000';
    const localGraphqlUrl = localStorage.getItem('api');
    localGraphqlUrl && console.warn(`
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    YOU ARE USING "api" TO OVERRIDE GRAPHQL ENDPOINT
    URL: ${localGraphqlUrl}
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    `);

    if(!window.__LIBEO__) window.__LIBEO__ = {};
    window.__LIBEO__.api = localGraphqlUrl || domain;

    return localGraphqlUrl || domain;
  }
};
