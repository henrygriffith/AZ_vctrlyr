import { get } from './main'

let day = '07/10/2022'
let weekStart = '07/04/2022'

const possibleCategoriesFor = {
    'race': ['African American', 'Asian', 'Caucasian', 'Hispanic', 'Native American', 'Unknown']
}

const $QL = {
    'SPECIFIC_DATE': (dt) => `c.dt_canv = '${dt}'`,
    'DATE_RANGE':  (start_dt, end_dt) => `c.dt_canv >= '${start_dt}' AND c.dt_canv <= '${end_dt}'`,
    'UP_TO_DATE': (dt) => `c.dt_canv <= '${dt}'`,

    'CANVASSED': () => `c.result = 'Canvassed'`
}

let selectedInput = 'race'

const createSQL = (inp = 'race', condArr, addlConds = []) => {
    condArr = condArr.concat(addlConds)
    let condString = condArr.join(' AND ')
    let sql = `
    SELECT 
        COUNT(v.${inp}) AS count, 
        v.${inp}
    FROM conthist AS c 
    INNER JOIN repvoters AS v 
    ON c.vanid = v.vanid 
    WHERE ${condString}
    GROUP BY v.${inp}`

    return sql
}

const onDateCond = (dt) => $QL['SPECIFIC_DATE'](dt)
const dateRangeCond = (dt1, dt2) => $QL['DATE_RANGE'](dt1, dt2)
const upToDateCond = (dt) => $QL['UP_TO_DATE'](dt)

const isCanvassed = () => $QL['CANVASSED']()

const prosthesifySQL = (sqlRows) => {
    const inp = selectedInput
    const limbs = possibleCategoriesFor[inp]
    limbs.forEach((lmb) => {
        if (sqlRows.some(obj => obj[inp] === lmb)) return;
        else sqlRows.push({ [inp]: lmb, count: 0})
    })
    return sqlRows.sort((a, b) => a[inp].localeCompare(b[inp]))
}

export const populateCanvassGrid = () => {
    const grid = document.getElementById('side-left-grid'),
        categoriesCol = document.getElementById('side-left-categories-col')
    categoriesCol.innerHTML = `
    <div class='side-left-grid-col-hdr'>
    </div>
    <div id='side-left-grid-cat-cont' class='side-left-grid-item-cont'></div>
    <div id='side-left-grid-cat-cont2' class='side-left-grid-item-cont'></div>
    `

    const onDateAll = createSQL(selectedInput, [onDateCond(day)]),
        weekUpToDateAll = createSQL(selectedInput, [dateRangeCond(weekStart, day)]),
        upToDateAll = createSQL(selectedInput, [upToDateCond(day)])

    const onDateCanv = createSQL(selectedInput, [onDateCond(day), isCanvassed()]),
        weekUpToDateCanv = createSQL(selectedInput, [dateRangeCond(weekStart, day), isCanvassed()]),
        upToDateCanv = createSQL(selectedInput, [upToDateCond(day), isCanvassed()])

    const affixSQLtoHTML = (data, day, n, isCanv = false) => {
        const catCol = grid.children.item(0)
        const col = grid.children.item(n)
        const itemCont = col.children.item(isCanv ? 2 : 1)
        const hdr = col.children.item(0)
        const dateText = hdr.children.item(1)
        let computedInputTotal = 0;

        dateText.innerHTML = day;
        data.forEach((dgrp) => {
            if (n === 1) {
                const catItemCont = catCol.children.item(isCanv ? 2 : 1)
                catItemCont.innerHTML += `<div class='side-left-grid-item'>${dgrp[selectedInput]}</div>`
            }
            computedInputTotal += dgrp.count
            const html = `<div class='side-left-grid-item'><span>${dgrp.count}</span></div>`
            itemCont.innerHTML += html
        })
    }

    get(onDateAll, '/').then((res) => affixSQLtoHTML(prosthesifySQL(res.data), day, 1))
    get(weekUpToDateAll, '/').then((res) => affixSQLtoHTML(prosthesifySQL(res.data), day, 2))
    get(upToDateAll, '/').then((res) => affixSQLtoHTML(prosthesifySQL(res.data), day, 3))

    get(onDateCanv, '/').then((res) => affixSQLtoHTML(prosthesifySQL(res.data), day, 1, true))
    get(weekUpToDateCanv, '/').then((res) => affixSQLtoHTML(prosthesifySQL(res.data), day, 2, true))
    get(upToDateCanv, '/').then((res) => affixSQLtoHTML(prosthesifySQL(res.data), day, 3, true))
}
