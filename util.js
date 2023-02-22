
export const pnameConversionChart = {
    "APACHE": { 2022: (pname, pnum) => removeNumsFromFront(pname)},
    "COCHISE": { 2022: (pname, pnum) => pname.toUpperCase()},
    "COCONINO": { 2022: (pname, pnum = 0) => {
      if (pname.indexOf('Flagstaff') != -1) return `${pname.toUpperCase()} ${pnum}`
      else return pname.toUpperCase()
    }},
    "GILA": { 2022: (pname, pnum) => {
      pname = pname.toUpperCase()
      if (pname.includes("SAN CARLOS")) return pname.replace(" COMMUNITY", "")
      return pname
    }},
    "GRAHAM": { 2022: (pname, pnum) => {
      pname = pname.toUpperCase();
      if (pname.includes("FT.")) return pname.replace("FT.", "FORT")
      return pname
    }},
    "GREENLEE": { 2022: (pname, pnum) => removeNumsFromFront(pname)},
    "LA PAZ": { 2022: (pname, pnum) => removeNumsFromFront(pname)},
    "MARICOPA": { 2022: (pname, pnum) => pname.toUpperCase()},
    "MOHAVE": { 2022: (pname, pnum) => pname.toUpperCase()},
    "NAVAJO": { 2022: (pname, pnum) => removeNumsFromFront(pname)},
    "PIMA": { 2022: (pname, pnum = 0) => "PRECINCT " + pnum.padStart(3, "0")},
    "PINAL": { 2022: (pname, pnum) => pname.toUpperCase()},
    "SANTA CRUZ": { 2022: (pname, pnum) => pname.toUpperCase()},
    "YAVAPAI": { 2022: (pname, pnum) => pname.toUpperCase()},
    "YUMA": { 2022: (pname, pnum) => {
      if (pname.length >= 3) pname = pname.slice(0, pname.indexOf("01"));
      return "PRECINCT " + pname.padStart(3, "0")
    }}
  }
  
  const removeNumsFromFront = (str, hasHyphen = false) => {
    str = hasHyphen ? str.split("-") : str.split(" ");
    str.shift();
    return str.join(" ").toUpperCase()
  }


  export const partyColors = {
    DEMOCRATIC: 'rgb(0, 125, 237)',
    DEMOCRATIC_BRIGHT: 'rgb(99, 178, 255)',
    DEMOCRATIC_BRIGHT_NEUTRAL: 'rgb(174, 188, 208)',
    DEMOCRATIC_NEUTRAL: 'rgb(112, 125, 150)',
    DEMOCRATIC_DARK: 'rgb(0, 36, 125)',
    DEMOCRATIC_DARK_NEUTRAL: 'rgb(30, 30, 51)',

    REPUBLICAN: 'rgb(227, 51, 61)',
    REPUBLICAN_BRIGHT: 'rgb(204, 167, 163)',
    REPUBLICAN_BRIGHT_NEUTRAL: 'rgb(255, 115, 112)',
    REPUBLICAN_NEUTRAL: 'rgb(153, 112, 110)',
    REPUBLICAN_DARK: 'rgb(102, 0, 0)',
    REPUBLICAN_DARK_NEUTRAL: 'rgb(49, 29, 25)',

    LIBERTARIAN: 'rgb(247, 212, 71)',
    LIBERTARIAN_BRIGHT: 'rgb(255, 251, 154)',
    LIBERTARIAN_BRIGHT_NEUTRAL: 'rgb(255, 255, 231)'
  }

  // export const politicalWeight = {

  // }