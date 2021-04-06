#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const program = require("commander");
const _1 = require(".");
const findPackage = require('find-package');
const log = require('simple-node-logger').createSimpleLogger();
program
    .version(findPackage(__dirname).version)
    .usage('[options] [branch]')
    .description('Generate a changelog for the specified branch (defaulting to the current branch)')
    .option('-v, --version-number <version>', 'The version of the new release')
    .option('-c, --codename <codename>', 'The codename of the new release')
    .option('-o, --outfile [path/to/file]', 'The path to the file where the changelog is written', './changelog.md')
    .option('-p, --path [path/to/repo]', 'Path to repository [defaults to currenty directory]', '.')
    .option('-s, --stable [stable-branch]', 'Stable branch containing containing commits to exclude')
    .option('-b, --blueprint [path/to/blueprint]', 'Path to the blueprint to use; defaults to built-in angularjs')
    .option('-l, --log-level <level>', 'Set the logging level: trace, debug, info, warn, error or fatal', 'info')
    .parse(process.argv);
const opts = program.opts();
const repoPath = path_1.resolve(opts['path']);
const branch = program.args[0];
const version = opts['versionNumber'];
const codename = opts['codename'];
const outfile = path_1.resolve(opts['outfile']);
const stable = opts['stable'];
const blueprintPath = opts['blueprint'] || 'changez-angular';
const blueprint = require(blueprintPath).default;
log.setLevel(opts['logLevel']);
log.info('Generating changelog...');
log.info(` - path to repo: "${repoPath}"`);
log.info(` - branch: "${branch || '-- current --'}"`);
if (stable) {
    log.info(` - stable branch: "${stable}"`);
}
log.info(` - blueprint: ${blueprint.name}`);
const changelog = new _1.Changelog(blueprint, new _1.GitRepo(repoPath), log);
const commits = changelog.getChanges(branch, stable);
const output = changelog.render(commits, version, codename, new Date());
fs_1.writeFileSync(outfile, output, { encoding: 'utf8' });
log.info(`Changes written to ${outfile}`);
//# sourceMappingURL=cli.js.map