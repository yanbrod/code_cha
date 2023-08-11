const fs = require('fs')
const csv = require('csv-parser')

const inputFile = 'input/orders_example.csv'

const bonusRules = {
    heart: [
        {
            name: 'heart',
            quantity: 1,
        },
    ],
    liver: [
        {
            name: 'lung',
            quantity: 1,
        },
    ],
    lung: [
        {
            name: 'liver',
            quantity: 1,
        },
        {
            name: 'heart',
            quantity: 1,
        },
    ],
}

function calculateOrder(record) {
    if (!record) return {}

    const item = record.organ
    const cash = parseInt(record.cash, 10)
    const price = parseInt(record.price, 10)
    const bonusRatio = parseInt(record.bonus_ratio, 10)

    if (!item || isNaN(cash) || isNaN(price) || isNaN(bonusRatio)) {
        throw new Error(`Invalid input: ${JSON.stringify(record)}`)
    }

    const purchased = Math.floor(cash / price)
    const bonuses = Math.floor(purchased / bonusRatio)

    const result = { [item]: purchased }

    if (bonuses > 0) {
        const bonusRule = bonusRules[item]

        bonusRule &&
            bonusRule.forEach((bonus) => {
                const bonusItems = bonus.quantity * bonuses
                if (result[bonus.name]) {
                    result[bonus.name] += bonusItems
                } else {
                    result[bonus.name] = bonusItems
                }
            })
    }

    return result
}

function readInputFile(input) {
    return new Promise((ok, err) => {
        const result = []

        fs.createReadStream(input)
            .on('error', (error) => err(error))
            .pipe(csv())
            .on('data', (data) => result.push(data))
            .on('end', () => ok(result))
    })
}

function formatOutput(record) {
    if(!record) return ''

    return `heart ${record.heart || 0}, liver ${record.liver || 0}, lung ${
        record.lung || 0
    }`
}

async function main() {
    try {
        const csvData = await readInputFile(inputFile)

        for (const item of csvData) {
            try {
                const order = calculateOrder(item)
                console.log(formatOutput(order))
            } catch (err) {
                console.error('Error', err)
            }
        }
    } catch (err) {
        console.error('Error', err)
    }
}

if (module === require.main) {
    main()
}

exports.readInputFile = readInputFile
exports.calculateOrder = calculateOrder
exports.formatOutput = formatOutput
