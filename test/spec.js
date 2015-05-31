describe('C&E Generator', function() {
    beforeEach(function beforeEach() {
        browser.get('http://localhost:4000/')
    })

    it('should have a title', function hasTitle() {
        expect(browser.getTitle()).toEqual('C&E Generator')
    })
})
