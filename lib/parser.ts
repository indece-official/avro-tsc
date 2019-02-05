import * as FS  from 'fs';
import * as Path from 'path';
import * as Debug from 'debug';
import { promisify } from 'util';
import { Options, DEFAULT_OPTIONS } from "./options";
import { RootElement, ElementType, ComposedType } from './element';

const logError      = Debug('avro-tsc.parser:error');
const logInfo       = Debug('avro-tsc.parser:info');
const logDebug      = Debug('avro-tsc.parser:debug');
const FSreaddir     = promisify(FS.readdir);
const FSstat        = promisify(FS.stat);
const FSreadFile    = promisify(FS.readFile);
//const FSwriteFile   = promisify(FS.writeFile);
//const FSmkdir       = promisify(FS.mkdir);


interface SubField
{
    name:   string;
    types:  Array<ComposedType>;
};


export class Parser
{
    private _TYPE_MAP: { [type: string]: ElementType }  = {
        'int':      ElementType.NUMBER,
        'fixed':    ElementType.NUMBER,
        'long':     ElementType.NUMBER,
        'short':    ElementType.NUMBER,
        'float':    ElementType.NUMBER,
        'string':   ElementType.STRING,
        'array':    ElementType.ARRAY
    };

    public options:     Options;


    constructor ( options?: Options )
    {
        this.options    = options || DEFAULT_OPTIONS;
    }


    private async _getFiles ( path: string, extension?: string ): Promise<Array<string>>
    {
        let subdirs = await FSreaddir(path);
        let files   = await Promise.all(subdirs.map(async ( subdir ) =>
        {
            const res = Path.resolve(path, subdir);

            return (await FSstat(res)).isDirectory() ? this._getFiles(res, extension) : res;
        }));

        let all_files   = Array.prototype.concat(...files);

        if ( extension )
        {
            all_files   = all_files.filter( s => s.endsWith(extension) );
        }

        return all_files;
    }


    private _parseAvroType ( avro_type: Array<string> | string ): Array<ComposedType>
    {
        let types   = avro_type;

        if ( ! Array.isArray(types) )
        {
            types  = [types];
        }

        return types.map( s => ({
            type:   this._TYPE_MAP[s] || s
        }));
    }


    private _processType ( avro:            any,
                           nspace?:         string,
                           root_elements?:  Array<RootElement>,
                           path?:           string,
                           is_root?:        boolean ): { root_elements: Array<RootElement>, field: SubField }
    {
        let field: SubField;

        let registered          = '';

        nspace          = avro.namespace || nspace || '';
        root_elements   = root_elements || [];
        path            = path || '';

        if ( typeof(is_root) === 'undefined' )
        {
            is_root = true;
        }

        //console.log(avro, avro.type);
        //console.log(`${nspace + '/' + avro.name} - is_root: ${is_root}`);

        field       = {
            name:       avro.name,
            types:      []
        };

        if ( Array.isArray(avro.type) )
        {
            /* Type is a union */
            // TODO
            for ( let type of avro.type )
            {
                if ( typeof(type) === 'object' )
                {
                    let sub_field   = this._processType(avro.type, nspace, root_elements, path + '/' + avro.name, false).field;

                    field.types = field.types.concat(sub_field.types);
                }
                else
                {
                    field.types = field.types.concat(this._parseAvroType(type));
                }
            }

        }
        else if ( typeof(avro.type) === 'object' )
        {
            /*
             * Type is a complex type (e.g. a record or Array-Subtype)
             *
             * Important: is not always an new RootElement, only if it has a name assigned
             */
            let sub_field   = this._processType(avro.type, nspace, root_elements, path + '/' + avro.name, avro.type.name && true).field;

            if ( sub_field.name )
            {
                field.types = [{
                    type:       sub_field.name
                }];
            }
            else
            {
                field.types = sub_field.types;
            }
        }
        else if ( avro.type == 'array' )
        {
            field.types = [{
                type:       ElementType.ARRAY,
                subtypes:   [
                    {
                        type:   this._processType(avro.items, nspace, root_elements, path + '/' + avro.name, true).field.name
                    }
                ]
            }];
        }
        else
        {
            field.types = this._parseAvroType(avro.type);
        }

        //console.log((is_root ? '[ROOT] ' : '       ') + field.name + ': ' + field.types.map( o => o.type).join(' | '));
        //console.log(path + '/' + field.name + ': ' + field.type + (registered ? ' => ' + registered : ''));

        if ( is_root && avro.name )
        {
            registered  = nspace + '/' + avro.name;

            root_elements.push({
                namespace:  nspace!,
                name:       avro.name,
                types:      field.types,
                schema:     avro,
                symbols:    avro.symbols,
                children:   avro.fields ? avro.fields.map( ( o: any ) => this._processType(o, nspace, root_elements, path + '/' + avro.name, false).field ) : []
            });
        }

        return {
            root_elements,
            field
        };
    }


    public parse ( avro: string | any ): Array<RootElement>
    {
        if ( typeof(avro) === 'string' )
        {
            avro    = JSON.parse(avro);
        }

        let elements    = this._processType(avro).root_elements;

        logDebug(`Found ${elements.length} root types`);

        return elements;
    }


    public async load ( ): Promise<Array<RootElement>>
    {
        let elements: Array<RootElement>    = [];

        logInfo(`Loading filelist for directory '${this.options.input_dir}' ...`);

        let filenames   = await this._getFiles(this.options.input_dir, this.options.input_extension);

        for ( let filename of filenames )
        {
            logInfo(`Loading file '${filename}' ...`);

            let content     = await FSreadFile(filename);

            elements    = elements.concat(this.parse(content.toString()));
        }

        return elements;
    }
}
