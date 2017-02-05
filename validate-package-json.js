#!/usr/bin/env node
'use strict';

const packageJSON = require('./package.json');

const invalid = ['dependencies', 'devDependencies'].some(prop => {
  const list = packageJSON[prop];

  const modules = Object.keys(list);

  // Make sure the module versions are exact, i.e. without `~` and `^`.
  return modules.some(moduleName => /[\^~]/.test(list[moduleName]));
});

if (invalid) {
  const RED_COLOR_START = '\x1B[31m';
  const COLOR_END = '\x1B[0m\r\n';
  const err = 'package.json: Error => an exact version of module dependencies must be specified; remove `~` and/or `^` from dependency versions.';

  process.stdout.write(RED_COLOR_START + err + COLOR_END);

  process.exit(1);
}
