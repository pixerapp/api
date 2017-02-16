'use strict';

const elasticsearch = require('elasticsearch');

class Elasticsearch {
  static getHosts({ hosts, port, protocol }) {
    return hosts.map(host => ({
      protocol,
      host,
      port,
    }));
  }

  constructor(options) {
    const { apiVersion, log, password, user } = options;
    
    this.client = elasticsearch.Client({
      apiVersion,
      httpAuth: password ? `${user}:${password}` : null,
      hosts: Elasticsearch.getHosts(options),
      log,
    });
  }

  get(index, type, id) {
    return this.client.get({
      index,
      type,
      id,
    });
  }

  save(options) {
    return this.client.index(options);
  }
}

module.exports = Elasticsearch;
