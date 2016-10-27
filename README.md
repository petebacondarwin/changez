# Changelog generator

This is yet another implementation of automatic changelog generation
from conventional commit messages.

It is built using TypeScript, so it is fully typed, and runs in NodeJS.
Generation is driven from a blueprint that allows complete customization
of the input and output.

Blueprints must implenent the `IBlueprint` interface:

* Parse any commit message:
  * `parseMessage(message: string): Commit;`
* Render a set of changes via nunjucks templates:
  * `getTemplateFolder(): string;`
  * `getTemplateName(): string;`
  * `configureRenderer?(env: Environment);`
* Filter commits based on their properties:
  * `filterCommit(commit: Commit): boolean;`
* Filter commits that have been cherry picked from another branch:
  * `compareCommits(left: Commit, right: Commit): boolean`

You can use Changez via the commandline or programmatically from NodeJS.

# Command Line Usage

## Installation
Install the tool globally:

```
npm install -g changez
```

## Getting help

Get the current usage information by running

```
changez --help
```

which outputs:

```
  Usage: changez [options] [branch]

  Generate a changelog for the specified branch (defaulting to the current branch)

  Options:

    -h, --help                           output usage information
    -V, --version                        output the version number
    -v, --version-number <version>       The version of the new release
    -c, --codename <codename>            The codename of the new release
    -o, --outfile [path/to/file]         The path to the file where the changelog is written
    -p, --path [path/to/repo]            Path to repository [defaults to currenty directory]
    -s, --stable [stable-branch]         Stable branch containing containing commits to exclude
    -b, --blueprint [path/to/blueprint]  Path to the blueprint to use; defaults to built-in angularjs
    -l, --log-level <level>              Set the logging level: trace, debug, info, warn, error or fatal
```

## Example

Generate a changelog
 * using the "angularjs" blueprint
 * for the project stored at "../angular.js"
 * on the "master" branch
 * for the "1.6.0-rc.0" release
 * with codename "bracing-vortex"
 * excluding matching commits from the "v1.5.x" branch.

```
changez master -p ../angular.js -s v1.5.x -v 1.6.0-rc.0 -c bracing-vortex

```
