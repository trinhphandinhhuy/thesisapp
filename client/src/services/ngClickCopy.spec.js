describe('Click Copy Service', function () {
    /*it('has a dummy spec to test 1 + 2', function () {
       expect(1 + 2).toEqual(3); 
    });*/

    var ngCopy;
    beforeEach(angular.mock.module('ngClickCopy'));

    beforeEach(inject(function (_ngCopy_) {
        ngCopy = _ngCopy_;
    }));

    it('should exist', function(){
        expect(ngCopy).toBeDefined();
    });

    // A set of tests for CopyToClipBoard dummy

    describe('CopyToClipBoard function', function(){
        //Test function exist
        it('should exist', function(){
            expect(ngCopy.CopyToClipBoard).toBeDefined();
        });
    });

})