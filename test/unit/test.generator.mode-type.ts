import { expect }       from 'chai';
import { Generator,
         ElementType,
         RootElement }  from '../../index';


function multiTrim ( str: string )
{
    return str.replace(/[\t\n]/g, ' ').replace(/\ {2,}/g, ' ').trim();
}


describe('Generator', ( ) =>
{
    describe('generate(...)', ( ) =>
    {
        describe('Mode "TYPE"', ( ) =>
        {
            let generator:  Generator;


            beforeEach( ( ) =>
            {
                generator   = new Generator();
            });


            it('Basic type: boolean', ( ) =>
            {
                let elements: Array<RootElement>    = [
                    {
                        schema:     {hello_world_schema: 'hello'},
                        name:       'TestBoolean',
                        namespace:  'test.namespace',
                        types:       [
                            {
                                type:       ElementType.BOOLEAN
                            }
                        ]
                    }
                ];

                let output  = generator.generate(elements);

                expect(output.length).to.equal(1);
                expect(multiTrim(output[0].content)).to.equal(multiTrim(
                    'export namespace test.namespace {\
                        export type TestBoolean = boolean;\
                    }'
                ));
            });


            it('Basic type: string', ( ) =>
            {
                let elements: Array<RootElement>    = [
                    {
                        schema:     {hello_world_schema: 'hello'},
                        name:       'TestString',
                        namespace:  'test.namespace',
                        types:       [
                            {
                                type:       ElementType.STRING
                            }
                        ]
                    }
                ];

                let output  = generator.generate(elements);

                expect(output.length).to.equal(1);
                expect(multiTrim(output[0].content)).to.equal(multiTrim(
                    'export namespace test.namespace {\
                        export type TestString = string;\
                    }'
                ));
            });


            it('Basic type: array of strings', ( ) =>
            {
                let elements: Array<RootElement>    = [
                    {
                        schema:     {hello_world_schema: 'hello'},
                        name:       'TestStringArray',
                        namespace:  'test.namespace',
                        types:       [
                            {
                                type:       ElementType.ARRAY,
                                subtypes:   [
                                    {
                                        type:   ElementType.STRING
                                    }
                                ]
                            }
                        ]
                    }
                ];

                let output  = generator.generate(elements);

                expect(output.length).to.equal(1);
                expect(multiTrim(output[0].content)).to.equal(multiTrim(
                    'export namespace test.namespace {\
                        export type TestStringArray = Array<string>;\
                    }'
                ));
            });


            it('Basic type: enum', ( ) =>
            {
                let elements: Array<RootElement>    = [
                    {
                        schema:     {hello_world_schema: 'hello'},
                        name:       'TestEnum',
                        namespace:  'test.namespace',
                        types:       [
                            {
                                type:       ElementType.ENUM
                            }
                        ],
                        symbols:    [
                            'VALUE_1',
                            'VALUE_2',
                            'VALUE_3'
                        ]
                    }
                ];

                let output  = generator.generate(elements);

                expect(output.length).to.equal(1);
                expect(multiTrim(output[0].content)).to.equal(multiTrim(
                    'export namespace test.namespace {\
                        export enum TestEnum\
                        {\
                            VALUE_1 = \'VALUE_1\',\
                            VALUE_2 = \'VALUE_2\',\
                            VALUE_3 = \'VALUE_3\'\
                        };\
                    }'
                ));
            });


            it('Complex type with simple subtypes', ( ) =>
            {
                let elements: Array<RootElement>    = [
                    {
                        schema:     {hello_world_schema: 'hello'},
                        name:       'TestRecord',
                        namespace:  'test.namespace',
                        types:       [
                            {
                                type:       ElementType.RECORD
                            }
                        ],
                        children:   [
                            {
                                name:   'TestString',
                                types:  [
                                    {
                                        type:       ElementType.STRING
                                    }
                                ]
                            },
                            {
                                name:   'TestBoolean',
                                types:       [
                                    {
                                        type:       ElementType.BOOLEAN
                                    }
                                ]
                            },
                            {
                                name:   'TestNumber',
                                types:       [
                                    {
                                        type:       ElementType.NUMBER
                                    }
                                ]
                            },
                            {
                                name:       'TestStringArray',
                                types:       [
                                    {
                                        type:       ElementType.ARRAY,
                                        subtypes:   [
                                            {
                                                type:   ElementType.STRING
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ];

                let output  = generator.generate(elements);

                expect(output.length).to.equal(1);
                expect(multiTrim(output[0].content)).to.equal(multiTrim(
                    'export namespace test.namespace {\
                        export type TestRecord = {\
                            TestString: string,\
                            TestBoolean: boolean,\
                            TestNumber: number,\
                            TestStringArray: Array<string>\
                        };\
                        \
                        export const TestRecord_SCHEMA = {\"hello_world_schema\":\"hello\"};\
                    }'
                ));
            });


            it('Complex type with simple subtypes and enum', ( ) =>
            {
                let elements: Array<RootElement>    = [
                    {
                        schema:     {hello_world_schema: 'hello'},
                        name:       'TestEnumType',
                        namespace:  'test.namespace',
                        types:       [
                            {
                                type:       ElementType.ENUM
                            }
                        ],
                        symbols:    [
                            'VALUE_1',
                            'VALUE_2',
                            'VALUE_3'
                        ]
                    },
                    {
                        schema:     {hello_world_schema: 'hello'},
                        name:       'TestRecord',
                        namespace:  'test.namespace',
                        types:       [
                            {
                                type:       ElementType.RECORD
                            }
                        ],
                        children:   [
                            {
                                name:   'TestString',
                                types:       [
                                    {
                                        type:       ElementType.STRING
                                    }
                                ]
                            },
                            {
                                name:   'TestBoolean',
                                types:       [
                                    {
                                        type:       ElementType.BOOLEAN
                                    }
                                ]
                            },
                            {
                                name:   'TestNumber',
                                types:       [
                                    {
                                        type:       ElementType.NUMBER
                                    }
                                ]
                            },
                            {
                                name:       'TestStringArray',
                                types:       [
                                    {
                                        type:       ElementType.ARRAY,
                                        subtypes:   [
                                            {
                                                type:   ElementType.STRING
                                            },
                                            {
                                                type:   ElementType.NULL
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name:       'TestEnum',
                                types:       [
                                    {
                                        type:       'TestEnumType'
                                    }
                                ]
                            }
                        ]
                    }
                ];

                let output  = generator.generate(elements);

                expect(output.length).to.equal(1);
                expect(multiTrim(output[0].content)).to.equal(multiTrim(
                    'export namespace test.namespace {\
                        export enum TestEnumType\
                        {\
                            VALUE_1 = \'VALUE_1\',\
                            VALUE_2 = \'VALUE_2\',\
                            VALUE_3 = \'VALUE_3\'\
                        };\
                        \
                        export type TestRecord = {\
                            TestString: string,\
                            TestBoolean: boolean,\
                            TestNumber: number,\
                            TestStringArray: Array<string | null>,\
                            TestEnum: TestEnumType\
                        };\
                        \
                        export const TestRecord_SCHEMA = {\"hello_world_schema\":\"hello\"};\
                    }'
                ));
            });
        });
    });
});
