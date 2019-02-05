import * as FS from 'fs';
import * as Path from 'path';
import * as Del from 'del';
import { promisify } from 'util';
import { RootElement, ElementType, Element } from './element';
import { Options, ExportMode, DEFAULT_OPTIONS } from './options';

const FSwriteFile   = promisify(FS.writeFile);
const FSmkdir       = promisify(FS.mkdir);
const FSexists      = promisify(FS.exists);

export type BaseTypeMap = any;


export interface ExportFile
{
    filename:   string;
    content:    string;
}


function elemGenType ( elem: Element ): string
{
    return elem.types
        .map( ( type ) =>
        {
            if ( type.subtypes && type.subtypes.length > 0 )
            {
                return `${type.type}<${type.subtypes.map( o => o.type ).join(' | ')}>`;
            }

            return type.type;
        })
        .join(' | ');
}


export interface Namespace
{
    name:       string;
    elements:   Array<RootElement>;
}


export interface NamespaceMap
{
    [name: string]: Namespace;
}


export interface BaseTypeConfig
{
    /**
     * Specifies if a root element can be an union type
     */
    root_union:     boolean;
}


export type BaseTypeConfigMap = {
    [mode in ExportMode]:   BaseTypeConfig;
};


export class Generator
{
    private _BASETYPE_CONFIG: BaseTypeConfigMap = {
        [ExportMode.TYPE]:  {
            root_union:     true
        },
        [ExportMode.INTERFACE]: {
            root_union:     false
        },
        [ExportMode.ABSTRACT]: {
            root_union:     false
        }
    };

    private _MAP_BASETYPE: BaseTypeMap   = {
        [ExportMode.TYPE]:  {
            [ElementType.DEFAULT]:  {
                complex:        false,
                ts:             ( elem: RootElement, tab: string ) =>
                                    `type ${elem.name} = ${elemGenType(elem)};`
            },
            [ElementType.ENUM]:  {
                complex:        false,
                ts:             ( elem: RootElement, tab: string ) =>
                                    `enum ${elem.name}\n{\n${elem.symbols!.map( s => (`${tab}${s} = \'${s}\'`) ).join(',\n')}\n};`
            },
            [ElementType.RECORD]:  {
                complex:        true,
                ts:             ( elem: RootElement, children: Array<string>, tab: string ) =>
                                    `type ${elem.name} = {\n${children.map( s => (tab + s) ).join(',\n')}\n};`,
                child_ts:       ( elem: Element ) =>
                                    `${elem.name}: ${elemGenType(elem)}`
            }
        }
    };

    public options:     Options;


    constructor ( options?: Options )
    {
        this.options   = options || DEFAULT_OPTIONS;
    }


    private _groupNamespaces ( elements: Array<RootElement> ): NamespaceMap
    {
        let namespaces: NamespaceMap  = {};

        for ( let element of elements )
        {
            if ( ! namespaces[element.namespace] )
            {
                namespaces[element.namespace]   = {
                    name:       element.namespace,
                    elements:   []
                }
            }

            namespaces[element.namespace].elements.push(element);
        }

        return namespaces;
    }


    /**
     * Sanitize all names and fix depending references
     */
    private _sanitizeNames ( namespaces: NamespaceMap )
    {
        let map: {[name: string]: true}     = {};

        for ( let key in namespaces )
        {
            let nspace = namespaces[key];

            // TODO
        }
    }


    /**
     * Generate output for one namespace
     */
    private _generateNamespace ( nspace: Namespace, level?: number ): string
    {
        let output = '';

        level   = level || 0;

        let export_mode     = this.options.export_mode;
        let padding         = this.options.tabulator.repeat(level);
        let padding_sub     = padding;

        if ( nspace.name )
        {
            padding_sub     += this.options.tabulator;

            output  += padding + `export namespace ${nspace.name} {\n`;
        }

        for( let element of nspace.elements )
        {
            let element_output  = '';

            if ( element.types.length != 1 )
            {
                /* Export mode supports unions as root-types (Else they must be handled by the calling object) */
                // TODO
                throw new Error('Root element has not exactly one type');
            }

            let type        = element.types[0].type;

            let baseType    = this._MAP_BASETYPE[export_mode][type] || this._MAP_BASETYPE[export_mode][ElementType.DEFAULT];

            if ( baseType.complex )
            {
                let children    = [];

                for ( let child of element.children! )
                {
                    children.push(baseType.child_ts(child));
                }

                // TODO: Add property SCHEMA if this.options.export_schema
                element_output  += 'export ' + baseType.ts(element, children, this.options.tabulator);

                if ( this.options.export_schema )
                {
                    element_output  += '\n\nexport const ' + element.name + '_SCHEMA = ' + JSON.stringify(element.schema) + ';';
                }
            }
            else
            {
                element_output  += 'export ' + baseType.ts(element, this.options.tabulator);
            }

            element_output      += '\n\n';

            output              += element_output.split('\n').map( s => s ? (padding_sub + s) : '' ).join('\n');
        }

        if ( nspace.name )
        {
            output  += padding + '}\n';
        }

        return output;
    }


    private _mergeFiles ( files: Array<ExportFile> ): ExportFile
    {
        let merged_file: ExportFile    = {
            filename:   'index.ts',
            content:    ''
        };

        merged_file.content     = files.map( o => o.content ).join('\n\n');

        return merged_file;
    }


    public generate ( elements: Array<RootElement> ): Array<ExportFile>
    {
        let files: Array<ExportFile>    = [];

        let namespaces  = this._groupNamespaces(elements);

        this._sanitizeNames(namespaces);

        for ( let key in namespaces )
        {
            let nspace  = namespaces[key];

            files.push({
                filename:   (key || 'default') + '.ts',
                content:    this._generateNamespace(nspace)
            });
        }

        return files;
    }


    public async dump ( elements: Array<RootElement> ): Promise<void>
    {
        let files   = this.generate(elements);

        if ( await FSexists(this.options.output_dir) )
        {
            await Del(this.options.output_dir, {force: true});
        }

        await FSmkdir(this.options.output_dir);

        if ( this.options.single_file )
        {
            files   = [this._mergeFiles(files)];
        }

        for ( let file of files )
        {
            let path = Path.resolve(this.options.output_dir, file.filename);

            await FSwriteFile(path, file.content);
        }
    }
}
