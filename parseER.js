import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "fast-csv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(typeof __dirname);

// ran this file once to compile er2022.json since this function can't be called on the clientside.

const getRowsFromCSV = () => {
  let results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, "./data/AZ_2022_ER.csv"))
      .pipe(parse({ headers: true }))
      .on("error", (e) => reject(e))
      .on("data", (row) => results.push(row))
      .on("end", (rowCount) => {
        console.log(`DONE ==> Parsed ${rowCount} rows.`);
        resolve(results);
      });
  });
};

/* map = 
{
    pname: {
        county: COUNTY
        contests: {
            contest1: {
                total: 10,
                candidates: [
                    {
                        name: NAME
                        party: PARTY,
                        votes: VOTES
                    },
                    {
                        name: NAME
                        party: PARTY,
                        votes: VOTES,
                    }
                ]
            }
        }
        
    }
}
*/
export const makeContsByPrec = async () => {
  const er = await getRowsFromCSV();
  let prec_map = {};
  let relevant_contests = ["GOVERNOR", "U.S. SENATOR", "ATTORNEY GENERAL"];
  er.forEach((r) => {
    if (!relevant_contests.includes(r["CONTEST_FULL_NAME"])) return;
    const {
      PRECINCT_NAME: precnm,
      COUNTY_NAME: counm,
      CANDIDATE_FULL_NAME: cndnm,
      TOTAL: votes,
      CandidateAffiliation: party,
      CONTEST_FULL_NAME: cntnm,
      CONTEST_TOTAL: tot,
    } = r;

    if (!prec_map[counm]) {
      prec_map[counm] = {}
    }
    if (!prec_map[counm][precnm]) {
      prec_map[counm][precnm] = {
        contests: {},
      };
    }
    const { contests } = prec_map[counm][precnm];
    if (!contests[cntnm]) {
      contests[cntnm] = {
        total: tot,
        candidates: [],
      };
    }
    contests[cntnm].candidates.push({ name: cndnm, party, votes });
  });
  return prec_map
};

makeContsByPrec().then((data) =>
    fs.writeFileSync(
      path.join(__dirname, './data/er2022.json'), JSON.stringify(data)
    )
)
