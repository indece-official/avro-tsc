export enum ExportMode
{
    TYPE        = 'type',
    INTERFACE   = 'interface',
    ABSTRACT    = 'abstract'
}


/**
 * Options for Generator
 */
export interface Options
{
    /**
     * Export as one single typescript file instead of one file per namespace
     *
     * @default false
     */
    single_file: boolean;

    /**
     * Select mode of typescript generation: TYPE | INTERFACE | ABSTRACT
     *
     * @default INTERFACE
     */
    export_mode: ExportMode;

    /**
     * Use namespaces for export
     *
     * @default true
     */
    namespaces: boolean;

    /**
     * Export schema as static property for each type
     *
     * @default true
     */
    export_schema: boolean;

    /**
     * Specify tabulator
     *
     * @default '\t'
     */
    tabulator: string;

    /**
     * Relative or absolute path of output directory
     *
     * @default './ts-out/'
     */
    output_dir: string;

    /**
     * Relative or absolute path of input directory
     *
     * @default './'
     */
    input_dir: string;

    /**
     * File extension to filter input files for (with leading '.')
     *
     * @default '.avro'
     */
    input_extension: string;

    /**
     * Don't output to console
     *
     * @default false
     */
    quiet: boolean;
}


export const DEFAULT_OPTIONS: Options = {
    single_file:        false,
    export_mode:        ExportMode.TYPE,    // TODO: INTERFACE
    namespaces:         true,
    export_schema:      true,
    tabulator:          '\t',
    output_dir:         './ts-out/',
    input_dir:          './',
    input_extension:    '.avro',
    quiet:              false
};
