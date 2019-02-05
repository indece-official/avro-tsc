# AVRO-TSC
[![License](https://img.shields.io/npm/l/avro-tsc.svg)](https://github.com/indece-official/avro-tsc/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/avro-tsc.svg)](https://www.npmjs.com/package/avro-tsc)

This is a alpha-version - please see section [Status](#status) for overview of currently implemented features.

## Installation
`> npm install avro-tsc -g`

## Usage
```
Usage: avro-tsc [options] <input_dir> <output_dir>

Options:

  -s, --single-file                  Merge all exported namespaces into one typescript file
  -e, --input-extension [extension]  Filter input files by extension (with leading '.') (default: .avro)
  -q, --quiet                        No console output
  -h, --help                         output usage information
```

## Example
Full example project for managing schemas/AVROs with Git:

## Status
Release type: **Alpha**

Currently supported AVRO-Schema-types:
* string
* long
* short
* boolean
* array
* record (complex types)
* enum
* union

## Development
### Commit message tags
* *chore:* Changes on build script
* *docs:* Documentation
* *feat:* New features
* *fix:* Bugfixes (no new features)
* *refactor:* Changes without affecting overall behaviour of code
* *style:* Style changes without changing behaviour of code
* *test:* Changes on tests
