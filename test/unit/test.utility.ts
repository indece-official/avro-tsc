import { expect }       from 'chai';
import { sanitizeName } from '../../lib/utility';


describe('Utility', ( ) =>
{
    describe('sanitizeName(...)', ( ) =>
    {
        it('Valid names', ( ) =>
        {
            expect(sanitizeName('NAME_test_1')).to.equal('NAME_test_1');
            expect(sanitizeName('_001')).to.equal('_001');
            expect(sanitizeName('a1b2c')).to.equal('a1b2c');
        });

        it('Names with invalid characters', ( ) =>
        {
            expect(sanitizeName('NAME.test.1')).to.equal('NAMETest1');
            expect(sanitizeName('$name')).to.equal('Name');
            expect(sanitizeName('a1-b-2c')).to.equal('a1B2c');
        });

        it('Names with leading digits', ( ) =>
        {
            expect(sanitizeName('1abcd')).to.equal('abcd');
            expect(sanitizeName('00011b')).to.equal('b');
        });

        it('Names with invalid characters and leading digits', ( ) =>
        {
            expect(sanitizeName('1.name')).to.equal('Name');
            expect(sanitizeName('$1name')).to.equal('name');
        });

        it('Invalid names');
    });
});
