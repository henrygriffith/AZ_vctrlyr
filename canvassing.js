import { get } from './main'


const SELECTED_DAY = '07/10/2022'
const SELECTED_DAY_MINUS_WEEK = '07/04/2022'
const LAST_DAY = '10/15/2022'
const $QL = {
    'SPECIFIC_DATE': (dt) => `c.dt_canv = '${dt}'`,
    'DATE_RANGE':  (start_dt, end_dt) => `c.dt_canv >= '${start_dt}' AND c.dt_canv <= '${end_dt}'`,
    'UP_TO_DATE': (dt) => `c.dt_canv <= '${dt}'`
}

const createSQL = (inp = 'race', condArr) => {
    let condString = condArr.join(' AND ')

    let sql = `
    SELECT 
        COUNT(v.${inp}) AS count, 
        v.${inp},
        COUNT(*) AS total
    FROM conthist AS c 
    INNER JOIN repvoters AS v 
    ON c.vanid = v.vanid 
    WHERE ${condString}
    GROUP BY v.${inp}`

    return sql
}

export const populateCanvassGrid = () => {
    // boolean to check for race names gotten
    const grid = document.getElementById('side-left-grid')

    const raceForDate = createSQL('race', [$QL['SPECIFIC_DATE'](SELECTED_DAY)])
    const raceForDateRange = createSQL('race', [$QL['DATE_RANGE'](SELECTED_DAY_MINUS_WEEK, SELECTED_DAY)])
    const raceUpToDate = createSQL('race', [$QL['UP_TO_DATE'](SELECTED_DAY)])

    get(raceForDate, '/').then((res) => affixSQLtoHTML(res.data, 'day of', SELECTED_DAY, grid, 0))
    get(raceForDateRange, '/').then((res) => affixSQLtoHTML(res.data, 'week ending', SELECTED_DAY, grid, 1))
    get(raceUpToDate, '/').then((res) => affixSQLtoHTML(res.data, 'campaign up to', SELECTED_DAY, grid, 2))
}

const affixSQLtoHTML = (data, header, day, parent, n) => {
    // bool checker
        // then loop thru to get names (order matters here)
    const newHome = parent.children.item(n)
    newHome.innerHTML = `
    <div class='side-left-grid-col-hdr'>
        <div>${header}</div>
        <div>${day}</div>
    </div>
    <div class='side-left-grid-item-cont'>
    </div>
    `
    let tot = 0
    data.forEach((dgrp) => {
        tot += dgrp.count;
        const html = `

        <div class='item'>
            <span>${dgrp.count}</span>
        </div>`
        parent.children.item(n).children.item(1).innerHTML += html
    })
}


