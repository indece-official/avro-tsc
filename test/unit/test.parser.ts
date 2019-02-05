import * as Path    from 'path';
import { expect }   from 'chai';
import { Parser }   from '../../lib/parser';
import { ElementType } from '../../lib/element';


describe('Parser', ( ) =>
{
    let parser: Parser;


    beforeEach( ( ) =>
    {
        parser  = new Parser();
    });


    describe('parse(...)', ( ) =>
    {
        it('Parse simple AVRO', ( ) =>
        {
            let avro        = {
                "type":         "record",
                "namespace":    "nspace",
                "name":         "TestType",
                "fields":       [
                    {
                        "name":     "PropTestString1",
                        "type":     "string"
                    },
                    {
                        "name":     "PropTestNumber1",
                        "type":     "int"
                    },
                    {
                        "name":     "PropTestNumber2",
                        "type":     "short"
                    },
                    {
                        "name":     "PropTestNumber3",
                        "type":     "long"
                    },
                    {
                        "name":     "PropTestNumber4",
                        "type":     "float"
                    },
                    {
                        "name":     "PropTestBoolean",
                        "type":     "boolean"
                    },
                    {
                        "name":     "PropTestEnum",
                        "type":     {
                            "name":     "TestEnum",
                            "type":     "enum",
                            "symbols":  [
                                "SYMBOL_1",
                                "SYMBOL_2",
                                "SYMBOL_3"
                            ]
                        }
                    },
                    {
                        "name":     "PropTestBooleanOrNull",
                        "type":     [
                            "null",
                            "boolean"
                        ]
                    }
                ]
            };

            let elements    = parser.parse(avro);

            //console.log(elements.map( o => `${o.namespace}.${o.name}: ${o.types.map( t => t.type).join(' | ')}`));

            expect(elements.length).to.equal(2);

            let element: any    = null;

            element     = elements.find( o => o.name == 'TestType');
            expect(element.namespace).to.equal('nspace');
            expect(element.types).to.deep.equal([{type: ElementType.RECORD}]);
            expect(element.children).to.not.be.null;
            expect(element.children!.length).to.equal(8);
            expect(element.children![0].types).to.deep.equal([{type: ElementType.STRING}]);
            expect(element.children![1].types).to.deep.equal([{type: ElementType.NUMBER}]);
            expect(element.children![2].types).to.deep.equal([{type: ElementType.NUMBER}]);
            expect(element.children![3].types).to.deep.equal([{type: ElementType.NUMBER}]);
            expect(element.children![4].types).to.deep.equal([{type: ElementType.NUMBER}]);
            expect(element.children![5].types).to.deep.equal([{type: ElementType.BOOLEAN}]);
            expect(element.children![6].types).to.deep.equal([{type: 'TestEnum'}]);
            expect(element.children![7].types).to.deep.equal([{type: ElementType.NULL}, {type: ElementType.BOOLEAN}]);

            element     = elements.find( o => o.name == 'TestEnum');
            expect(element.namespace).to.equal('nspace');
            expect(element.types).to.deep.equal([{type: ElementType.ENUM}]);
            expect(element.symbols!.length).to.equal(3);
        });

        it('Parse complex AVRO', ( ) =>
        {
            let avro        = {
                "type":         "record",
                "namespace":    "nspace",
                "name":         "TestType",
                "fields":       [
                    {
                        "name":     "PropTestString1",
                        "type":     "string"
                    },
                    {
                        "name":     "PropTestSubType1",
                        "type":     {
                            "name":     "TestSubType1",
                            "type":     "record",
                            "fields":   [
                                {
                                    "name":     "PropTestString2",
                                    "type":     "string"
                                },
                                {
                                    "name":         "PropTestEnum",
                                    "namespace":    "nspace.subspace1",
                                    "type":         {
                                        "name":         "TestEnum",
                                        "namespace":    "nspace.subspace1",
                                        "type":         "enum",
                                        "symbols":      [
                                            "SYMBOL_1",
                                            "SYMBOL_2",
                                            "SYMBOL_3"
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "name":     "PropTestSubType2",
                        "type":     {
                            "name":     "TestSubType2Array",
                            "type":     "array",
                            "items":    {
                                "name":         "TestSubType2",
                                "namespace":    "nspace.subspace2",
                                "type":         "record",
                                "fields":       [
                                    {
                                        "name":         "PropTestSubType3",
                                        "type":         {
                                            "name":         "TestSubType3",
                                            "type":         "record",
                                            "fields":       [
                                                {
                                                    "name":     "TestNumber",
                                                    "type":     "long"
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]
            };


            let elements    = parser.parse(avro);

            //console.log(elements.map( o => `${o.namespace}.${o.name} <${o.type}>`));

            //console.log(elements.map( o => `${o.namespace}.${o.name}: ${o.types.map( t => t.type).join(' | ')}`));

            expect(elements.length).to.equal(6);

            let element: any    = null;

            element     = elements.find( o => o.name == 'TestSubType1');
            expect(element.namespace).to.equal('nspace');
            expect(element.types).to.deep.equal([{type: ElementType.RECORD}]);

            element     = elements.find( o => o.name == 'TestSubType3');
            expect(element.namespace).to.equal('nspace.subspace2');
            expect(element.types).to.deep.equal([{type: ElementType.RECORD}]);

            element     = elements.find( o => o.name == 'TestSubType2');
            expect(element.namespace).to.equal('nspace.subspace2');
            expect(element.types).to.deep.equal([{type: ElementType.RECORD}]);

            element     = elements.find( o => o.name == 'TestType');
            expect(element.namespace).to.equal('nspace');
            expect(element.types).to.deep.equal([{type: ElementType.RECORD}]);

            element     = elements.find( o => o.name == 'TestEnum');
            expect(element.namespace).to.equal('nspace.subspace1');
            expect(element.types).to.deep.equal([{type: ElementType.ENUM}]);

            element     = elements.find( o => o.name == 'TestSubType2Array');
            expect(element.namespace).to.equal('nspace');
            expect(element.types).to.deep.equal([{type: ElementType.ARRAY, subtypes: [{type: 'TestSubType2'}]}]);
        });


        it('Nested arrays', ( ) =>
        {
            let avro        = {
                "type":         "record",
                "namespace":    "nspace",
                "name":         "TestType",
                "fields":       [
                    {
                        "name":     "PropTestArray",
                        "type":     {
                            "name":     "TestArray",
                            "type":     "array",
                            "items":    {
                                "name":         "TestSubArray",
                                "namespace":    "nspace.subspace",
                                "type":         "array",
                                "items":       {
                                    "name":         "TestSubType",
                                    "type":         "record",
                                    "fields":       [
                                        {
                                            "name":     "PropTestNumber",
                                            "type":     "long"
                                        }
                                    ]
                                }
                            }
                        }
                    }
                ]
            };


            let elements    = parser.parse(avro);

            //console.log(elements.map( o => `${o.namespace}.${o.name} <${o.type}>`));

            expect(elements.length).to.equal(4);

            let element: any    = null;

            element     = elements.find( o => o.name == 'TestType');
            expect(element.namespace).to.equal('nspace');
            expect(element.types).to.deep.equal([{type: ElementType.RECORD}]);

            element     = elements.find( o => o.name == 'TestArray');
            expect(element.namespace).to.equal('nspace');
            expect(element.types).to.deep.equal([{type: ElementType.ARRAY, subtypes: [{type: 'TestSubArray'}]}]);

            element     = elements.find( o => o.name == 'TestSubArray');
            expect(element.namespace).to.equal('nspace.subspace');
            expect(element.types).to.deep.equal([{type: ElementType.ARRAY, subtypes: [{type: 'TestSubType'}]}]);

            element     = elements.find( o => o.name == 'TestSubType');
            expect(element.namespace).to.equal('nspace.subspace');
            expect(element.types).to.deep.equal([{type: ElementType.RECORD}]);
        });

        it('Nested unions');

        it('Nested records');
    });


    describe('load(...)', ( ) =>
    {
        it('Load single file', async ( ) =>
        {
            parser.options.input_dir    = Path.resolve(__dirname, './data/test.parser.load.single/');

            let elements    = await parser.load();

            expect(elements.length).to.equal(1);
        });


        it('Load multiple files with subfolders', async ( ) =>
        {
            parser.options.input_dir    = Path.resolve(__dirname, './data/test.parser.load.multi/');

            let elements    = await parser.load();

            expect(elements.length).to.equal(5);
        });
    });
});
