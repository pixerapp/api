'use strict';

const config = require('config');
const elasticsearch = require('elasticsearch');

function getHosts() {
  const port = config.get('es.port');
  const protocol = config.get('es.protocol');
  const user = config.has('es.user');
  const auth = user ? `${user}:${config.get('es.password')}@` : '';

  return config.get('es.hosts').map(host => {
    return `${protocol}://${auth}${host}:${port}`;
  });
}

module.exports = elasticsearch.Client({
  apiVersion: config.get('es.apiVersion'),
  hosts: getHosts(),
  log: {
    type: config.get('es.log.type'),
    level: config.get('es.log.level'),
    path: config.get('es.log.path'),
  }
});
