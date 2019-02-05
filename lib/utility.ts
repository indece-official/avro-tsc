export function sanitizeName ( str: string): string
{
    return str
        /* Remove all non-word-characters (but uppercase next character if it exists) */
        .replace(/[\W]+(\w)?/g, ( _: string, b: string ) => (b ? b.toUpperCase() : '') )
        /* Remove all leading digits */
        .replace(/^\d+/, '');
}
