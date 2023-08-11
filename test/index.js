const fs = require('fs')
const { expect } = require('chai')
const { readInputFile, calculateOrder, formatOutput } = require('../server')

describe('readInputFile', () => {
    it('should parse a CSV file into an array of objects', (done) => {
        const filePath = './test.csv'
        const csvData = 'name,age\nJohn,25\nJane,30\n'

        // Create a test CSV file
        fs.writeFileSync(filePath, csvData)

        readInputFile(filePath).then((parsedData) => {
            expect(parsedData).to.be.an('array')
            expect(parsedData).to.have.lengthOf(2)

            expect(parsedData[0]).to.deep.equal({ name: 'John', age: '25' })
            expect(parsedData[1]).to.deep.equal({ name: 'Jane', age: '30' })

            // Clean up the test file
            fs.unlinkSync(filePath)
            done()
        })
    })

    it('should fail on non-existent or corrupt file', (done) => {
        const filePath = './test.csv'

        readInputFile(filePath).catch((error) => {
            expect(error).to.be.an('error')
            done()
        })
    })
})

describe('calculateOrder', () => {
    it('should calculate the ordered goods and bonus for them', () => {
        const orders = [
            { organ: 'liver', cash: '10', price: '5', bonus_ratio: '2' },
            { organ: 'heart', cash: '10', price: '3', bonus_ratio: '3' },
            { organ: 'lung', cash: '25', price: '3', bonus_ratio: '4' },
        ]

        const expected = [
            { liver: 2, lung: 1 },
            { heart: 4 },
            { lung: 8, heart: 2, liver: 2 },
        ]

        expect(calculateOrder(orders[0])).to.deep.equal(expected[0])
        expect(calculateOrder(orders[1])).to.deep.equal(expected[1])
        expect(calculateOrder(orders[2])).to.deep.equal(expected[2])
        
    })

    it('should return an empty object if the order is empty', () => {
        expect(calculateOrder(undefined)).to.deep.equal({})
    })

    it('should throw an error if the order is corrupt', () => {
        expect(() => calculateOrder({})).to.throw()
        expect(() => calculateOrder({ organ: 'liver' })).to.throw()
        expect(() => calculateOrder({ organ: 'liver', cash: '10' })).to.throw()
        expect(() => calculateOrder({ organ: 'liver', cash: '10', price: '5' })).to.throw()
        expect(() => calculateOrder({ organ: 'liver', cash: 'a', price: 'b' })).to.throw()
        expect(() => calculateOrder({ organoid: 'intestine', cash: 'a', price: 'b' })).to.throw()
        
    })
})

describe('formatOutput', () => {
    it('should format the output correctly', () => {
        const orders = [
            { liver: 2, lung: 1 },
            { heart: 4 },
            { lung: 8, heart: 2, liver: 2 },
        ]

        const expected = [
            'heart 0, liver 2, lung 1',
            'heart 4, liver 0, lung 0',
            'heart 2, liver 2, lung 8',
        ]

        expect(formatOutput(orders[0])).to.equal(expected[0])
        expect(formatOutput(orders[1])).to.equal(expected[1])
        expect(formatOutput(orders[2])).to.equal(expected[2])
    })

    it('should return an empty string if the order is empty', () => {
        expect(formatOutput(undefined)).to.equal('')
    })
})