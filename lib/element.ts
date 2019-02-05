export enum ElementType {
    DEFAULT = '_',
    BOOLEAN = 'boolean',
    STRING  = 'string',
    NUMBER  = 'number',
    RECORD  = 'record',
    ARRAY   = 'Array',
    ENUM    = 'enum',
    NULL    = 'null'
}


export interface ComposedType
{
    type:       ElementType | string;
    subtypes?:  Array<ComposedType>;
}


export interface Element
{
    name:       string;
    types:      Array<ComposedType>;
    symbols?:   Array<string>;
}


export interface RootElement extends Element
{
    namespace:  string;
    schema:     any;
    children?:  Array<Element>;
}
