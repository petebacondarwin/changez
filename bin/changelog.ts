import {resolve} from 'path';
import * as program from 'commander';
import {GitRepo, IBlueprint, Changelog} from '../lib';

const log = require('simple-node-logger').createSimpleLogger();

program
  .version(require('../package.json').version)
  .usage('[options] [branch]')
  .description('Generate a changelog for the specified branch (defaulting to the current branch)')
  .option('-p, --path [path/to/repo]', 'Path to repository [defaults to currenty directory]', '.')
  .option('-s, --stable [stable-branch]', 'Stable branch containing containing commits to exclude')
  .option('-b, --blueprint [path/to/blueprint]', 'Path to the blueprint to use')
  .option('-l, --log-level <level>', 'Set the logging level: trace, debug, info, warn, error or fatal', 'info')
  .parse(process.argv);

const repoPath = resolve(program['path']);
const branch = program.args[0];
const stable = program['stable'];
const blueprintPath = program['blueprint'] || '../lib/blueprints/angularjs';
const blueprint = require(blueprintPath).default as IBlueprint;
log.setLevel(program['logLevel']);

log.info('Generating changelog...');
log.info(` - path to repo: "${repoPath}"`);
log.info(` - branch: "${branch || '-- current --'}"`);
if (stable) {
  log.info(` - stable branch: "${stable}"`);
}
log.info(` - blueprint: ${blueprint.name}`);

const changelog = new Changelog(blueprint, new GitRepo(repoPath), log);

const commits = changelog.getChanges(branch, stable);
console.log(commits.map(commit => commit.toString()));
