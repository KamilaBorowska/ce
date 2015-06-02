describe('C&E Generator', function() {
    beforeEach(function beforeEach() {
        browser.get('http://localhost:4000/')
    })

    it('should have a title', function hasTitle() {
        expect(browser.getTitle()).toEqual('C&E Generator')
    })

    it('should display allowed number of participants', function participants() {
        element(by.cssContainingText('option', 'NU')).click()
        element(by.model('ce.participants')).getText().then(function (options) {
            expect(options.trim().split(/\s+/)).toEqual(['8', '16', '32', '64'])
        })
    })

    it('should display allowed number of participants for monotype', function monotypeParticipants() {
        element(by.cssContainingText('option', 'Monotype')).click()
        element(by.cssContainingText('option', 'Dragon')).click()
        element(by.model('ce.participants')).getText().then(function (options) {
            expect(options.trim().split(/\s+/)).toEqual(['8'])
        })
    })
})
