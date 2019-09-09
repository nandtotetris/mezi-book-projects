const getIp = () => {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'development') return resolve('localhost');
    const req = new XMLHttpRequest();
    req.open('GET', 'https://httpbin.org/ip', false);
    req.send(null);
    let result;
    try {
      result = JSON.parse(req.response);
      result = result.origin.match(/(.*?),/);
      if(result[1]) resolve(result[1]);
    } catch(e) {
      resolve();
    }
  });
}

export default async () => {
  const ip = await getIp();

  return ip;
}
