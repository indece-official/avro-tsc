import * as Commander from 'commander';
import { Parser } from './lib/parser';
import { Generator } from './lib/generator';
import { Options, DEFAULT_OPTIONS } from './lib/options';

export * from './lib/options';
export * from './lib/generator';
export * from './lib/element';


export async function main ( ): Promise<number>
{
    Commander
        // TODO: .version(Package.version)
        .usage('[options] <input_dir> <output_dir>')
        //.option('-m, --export-mode [mode]', 'Export mode for typescript files [type|interface|abstract]', DEFAULT_OPTIONS.export_mode)
        .option('-s, --single-file', 'Merge all exported namespaces into one typescript file', DEFAULT_OPTIONS.single_file)
        .option('-e, --input-extension [extension]', 'Filter input files by extension (with leading \'.\')', DEFAULT_OPTIONS.input_extension)
        .option('-q, --quiet', 'No console output', DEFAULT_OPTIONS.quiet)
        .parse(process.argv);

    if ( ! Commander.args[0] )
    {
        throw new Error('Missing param <input_dir>');
    }

    if ( ! Commander.args[1] )
    {
        throw new Error('Missing param <output_dir>');
    }

    let options: Options     = {
        ...DEFAULT_OPTIONS,
        //export_mode:        Commander.exportMode,
        single_file:        Commander.singleFile,
        input_extension:    Commander.inputExtension,
        quiet:              Commander.quiet,
        input_dir:          Commander.args[0],
        output_dir:         Commander.args[1]
    };

    let parser      = new Parser(options);
    let generator   = new Generator(options);

    let elements    = await parser.load();

    await generator.dump(elements);

    return 0;
}


if ( require.main === module )
{
    main()
        .then(process.exit)
        .catch( ( err ) => console.error('Error: ' + err.message) )
        .then( ( ) => process.exit(1));
}
