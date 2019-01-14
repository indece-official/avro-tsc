#!/usr/bin/env node

const FS            = require('fs');
const Util          = require('util');
const Path          = require('path');
const ChildProcess  = require('child_process');
const Del           = require('del');

const FSreaddir     = Util.promisify(FS.readdir);
const FSstat        = Util.promisify(FS.stat);
const FSreadFile    = Util.promisify(FS.readFile);
const FSwriteFile   = Util.promisify(FS.writeFile);
const FSmkdir       = Util.promisify(FS.mkdir);


const TYPE_MAP      = {
    'long':             'number',
    'short':            'number'
};


async function getFiles ( dir, extension )
{
    let subdirs = await FSreaddir(dir);
    let files   = await Promise.all(subdirs.map(async ( subdir ) =>
    {
        const res = Path.resolve(dir, subdir);

        return (await FSstat(res)).isDirectory() ? getFiles(res) : res;
    }));

    files   = Array.prototype.concat(...files);

    if ( extension )
    {
        //console.log(files);

        files   = files.filter( s => s.endsWith(extension) );
    }

    return files;
}


function processType ( avro, namespace, records, path )
{
    let field   = null;
    let registered  = '';

    records     = records || [];
    namespace   = avro.namespace || namespace || '';
    path        = path || '';

    if ( typeof(avro.type) === 'object' )
    {
        field       = processType(avro.type, namespace, records, path + '/' + avro.name).field;
        field.name  = avro.name;
    }
    else if ( avro.type == 'record' )
    {
        registered  = namespace + '/' + avro.name;

        records.push({
            namespace:  namespace,
            name:       avro.name,
            schema:     avro,
            fields:     avro.fields.map( o => processType(o, namespace, records, path + '/' + avro.name).field )
        });

        field       = {
            name:       avro.name,
            type:       avro.name
        };
    }
    else if ( avro.type == 'array' )
    {
        field       = {
            name:       avro.name,
            type:       {
                Array: processType(avro.items, namespace, records, path + '/' + avro.name).field.type
            }
        };
    }
    else
    {
        field       = avro;
        field.type  = TYPE_MAP[avro.type] || avro.type;
    }

    //console.log(path + '/' + field.name + ': ' + field.type + (registered ? ' => ' + registered : ''));

    return {
        records,
        field
    };
}


function usage ( )
{
    console.log('Usage:');
    console.log('> avro-tsc $INPUT_DIR $OUTPUT_DIR');
}


async function main ( directory_in, directory_out )
{
    if ( ! directory_in )
    {
        throw new Error('Parameter "input directory" missing');
    }

    if ( ! directory_out )
    {
        throw new Error('Parameter "output directory" missing');
    }

    let filenames_out   = [];
    let namespaces      = {};

    await Del(directory_out + '/*');

    for ( let filename_in of await getFiles(directory_in, '.avro') )
    {
        let content     = JSON.parse(await FSreadFile(filename_in));

        let types       = processType(content).records;

        for ( let type of types )
        {
            let output  = `\texport type ${type.name} = {\n`;

            output      += '\t\tSCHEMA: ' + JSON.stringify(type.schema) + ',\n\n';

            for ( let field of type.fields )
            {
                if ( typeof(field.type) === 'object' )
                {
                    let key     = Object.keys(field.type)[0];

                    output  += `\t\t${field.name}: ${key}<${field.type[key]}>,\n`;
                }
                else
                {
                    output  += `\t\t${field.name}: ${field.type},\n`;
                }
            }

            output  += '\t};\n';
            output  += '\n';

            if ( ! namespaces[type.namespace] )
            {
                namespaces[type.namespace]  = output;
            }
            else
            {
                namespaces[type.namespace]  += output;
            }
        }
    }

    let output_index    = '';

    for ( let namespace in namespaces )
    {
        let subpath         = namespace.replace(/\./g, '/');

        let filename_out    = Path.join(directory_out, subpath + '.ts');

        filenames_out.push(Path.join(subpath + '.ts'));

        output_index            += `export namespace ${namespace} {\n${namespaces[namespace]}}\n\n\n`;
    }

    filename_out    = Path.join(directory_out, 'index.ts');

    await FSmkdir(Path.dirname(filename_out), {recursive: true});
    await FSwriteFile(filename_out, output_index);

    console.log('Wrote file ' + filename_out);
}


main(process.argv[2], process.argv[3])
    .then(process.exit)
    .catch( ( err ) =>
    {
        console.error(err);

        usage();

        process.exit(1);
    });
