describe('C&E Generator', function() {
    beforeEach(function beforeEach() {
        browser.get('http://localhost:4000/')
    })

    it('should have a title', function hasTitle() {
        expect(browser.getTitle()).toEqual('C&E Generator')
    })

    it('should display allowed number of participants', function participants() {
        element(by.cssContainingText('option', 'RU')).click()
        element(by.model('ce.participants')).getText().then(function (options) {
            expect(options.trim().split(/\s+/)).toEqual(['8', '16', '32', '64'])
        })
    })

    it('should display allowed number of participants for monotype', function monotypeParticipants() {
        element(by.cssContainingText('option', 'Monotype')).click()
        element(by.cssContainingText('option', 'Steel')).click()
        element(by.model('ce.participants')).getText().then(function (options) {
            expect(options.trim().split(/\s+/)).toEqual(['8'])
        })
    })

    it('should allow rerolling', function reroll() {
        element.all(by.cssContainingText('option', '8')).first().click()
        element.all(by.repeater('player in ce.players')).each(function (row) {
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

    it('should cap participants at 64', function cap() {
        element(by.model('ce.participants')).getText().then(function (options) {
            expect(options.trim().split(/\s+/)).toEqual(['8', '16', '32', '64'])
        })
        browser.switchTo().alert().then(function (alert) {
            alert.accept()
        })
    })
})
