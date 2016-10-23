# Changelog generator

This is yet another implementation of automatic changelog generation
from conventional commit messages.

# Installation
```
npm install -g changez
```

# Usage

Get the usage information by running

```
changez --help
```

Generate a changelog, using the "angularjs" blueprint, for the "angular.js" project
on the "master" branch for the "1.6.0-rc.0" release, codename "bracing-vortex";
excluding matching commits from the "v1.5.x" branch.

```
changez master -p ../angular.js -s v1.5.x -v 1.6.0-rc.0 -c bracing-vortex

```