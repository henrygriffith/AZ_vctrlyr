import { get } from './main'


const LAST_DAY = '10/15/2022'

const $QL = {
    'SPECIFIC_DATE': (dt) => `c.dt_canv = '${dt}'`,
    'DATE_RANGE':  (start_dt, end_dt) => `c.dt_canv >= '${start_dt}' AND c.dt_canv <= '${end_dt}'`,
    'UP_TO_DATE': (dt) => `c.dt_canv <= '${dt}'`
}

const createSQL = (inp = 'race', condArr) => {
    let condString = condArr.join(' AND ')
    console.log(condString)

    let sql = `
    SELECT 
        COUNT(v.${inp}), 
        v.${inp}
    FROM conthist AS c 
    INNER JOIN repvoters AS v 
    ON c.vanid = v.vanid 
    WHERE ${condString}
    GROUP BY v.${inp}`

    return sql
}

const raceForDate = createSQL('race', [$QL['SPECIFIC_DATE']('07/10/2022')])
const raceForDateRange = createSQL('race', [$QL['DATE_RANGE']('07/04/2022', '07/10/2022')])
const raceUpToDate = createSQL('race', [$QL['UP_TO_DATE'](LAST_DAY)])

console.log(raceForDate)
console.log(raceForDateRange)
console.log(raceUpToDate)

await get(raceForDate, '/').then((res) => console.log(res.data))
await get(raceForDateRange, '/').then((res) => console.log(res.data))
await get(raceUpToDate, '/').then((res) => console.log(res.data))


