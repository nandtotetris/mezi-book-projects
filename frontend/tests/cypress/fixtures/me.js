module.exports = {
  data: {
    me: {
      id: '56',
      firstname: 'nico',
      lastname: 'labbe',
      email: 'nicolas.labbe+1@test.fr',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5pY29sYXMubGFiYmUrMUBhZGZhYi5mciIsImlhdCI6MTU1MjM3MzkzOCwiZXhwIjoxNTUyMzc3NTM4fQ.9Y48RTidLTzhiMEg7qKxSWd-dO0c7Pbs7hd2wMvsO0g',
      lastLogin: 1551168330661,
      lastCguAccept: 1551168330661,
      createdAt: 1551168330787,
      updatedAt: 1552373938098,
      companies: require('./companies.js').data.companies,
      currentCompany: require('./currentCompany.js').data.currentCompany,
      __typename: 'User'
    }
  }
}
