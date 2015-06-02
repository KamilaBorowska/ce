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

    it('should not display allowed number of participants for non-mega dragon monotype', function nonMegaDragon() {
        element(by.cssContainingText('option', 'Monotype')).click()
        element(by.cssContainingText('option', 'Dragon')).click()
        element(by.model('ce.megas')).click()
        element(by.model('ce.participants')).getText().then(function (options) {
            expect(options.trim()).toEqual("")
        })
    })

    it('should allow rerolling', function reroll() {
        element.all(by.cssContainingText('option', '8')).first().click()
        element.all(by.repeater('i in ce.repeatParticipants()')).each(function (row) {
            row.element(by.css('[readonly]')).getAttribute('value').then(function (value) {
                originalValue = value
                var reroll = row.element(by.cssContainingText('button', 'Reroll'))
                expect(reroll.getText()).toEqual('Reroll')
                reroll.click()
                expect(reroll.getText()).toEqual('Reroll (1)')
                expect(row.element(by.css('[readonly]')).getAttribute('value')).not.toEqual(value)
            })
        })
    })
})
