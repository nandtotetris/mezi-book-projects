const {SnakeNamingStrategy} = require('./src/naming-strategy')

console.log(SnakeNamingStrategy)

module.exports = {
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": "sammy",
  "password": "croute",
  "database": "croute",
  "entities": ["./src/**/*.entity.ts"],
  "namingStrategy": new SnakeNamingStrategy()
}