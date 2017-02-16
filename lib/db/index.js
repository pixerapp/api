'use strict';

const config = require('config');

const Elasticsearch = require(`./elasticsearch`);

module.exports = new Elasticsearch(config.get('db'));
