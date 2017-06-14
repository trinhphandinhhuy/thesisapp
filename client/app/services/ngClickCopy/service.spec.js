describe('ClickCopy Service', function () {
    /*
    it('has a dummy function to test 1 + 2', function () {
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

    // A set of tests for CopyToClipBoard
    describe('CopyToClipBoard function', function(){
        it('should exist', function(){
            expect(ngCopy.CopyToClipBoard).toBeDefined();
        });
    });

})
