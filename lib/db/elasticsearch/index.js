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
      id
    });
  }

  filter(index, type, filterOptions) {
    let filter = [];
    let body = {
      query: {
        bool: {
          filter
        }
      }
    };

    Object.keys(filterOptions).forEach(key => filter.push({
      term: filterOptions[key]
    }));

    return this.client.search({
      index,
      type,
      body
    });
  }

  save(index, type, id, body) {
    return this.client.index({
      index,
      type,
      id,
      body
    });
  }

  update(index, type, id, doc, version) {
    return this.client.update({
      index,
      type,
      id,
      body: {
        doc
      },
      version
    });
  }
}

module.exports = Elasticsearch;
