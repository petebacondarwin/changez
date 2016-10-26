#!/usr/bin/env node
"use strict";
var path_1 = require('path');
var fs_1 = require('fs');
var program = require('commander');
var _1 = require('.');
var findPackage = require('find-package');
var log = require('simple-node-logger').createSimpleLogger();
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
var repoPath = path_1.resolve(program['path']);
var branch = program.args[0];
var version = program['versionNumber'];
var codename = program['codename'];
var outfile = path_1.resolve(program['outfile']);
var stable = program['stable'];
var blueprintPath = program['blueprint'] || 'changez-angular';
var blueprint = require(blueprintPath).default;
log.setLevel(program['logLevel']);
log.info('Generating changelog...');
log.info(" - path to repo: \"" + repoPath + "\"");
log.info(" - branch: \"" + (branch || '-- current --') + "\"");
if (stable) {
    log.info(" - stable branch: \"" + stable + "\"");
}
log.info(" - blueprint: " + blueprint.name);
var changelog = new _1.Changelog(blueprint, new _1.GitRepo(repoPath), log);
var commits = changelog.getChanges(branch, stable);
var output = changelog.render(commits, version, codename, new Date());
fs_1.writeFileSync(outfile, output, { encoding: 'utf8' });
log.info("Changes written to " + outfile);
