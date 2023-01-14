
export const pnameConversionChart = {
    "APACHE": { 2022: (pname) => removeNumsFromFront(pname)},
    "COCHISE": { 2022: (pname) => pname.toUpperCase()},
    "COCONINO": { 2022: (pname, pnum) => {
      if (pname.indexOf('Flagstaff') != -1) return `${pname.toUpperCase()} ${pnum}`
      else return pname.toUpperCase()
    }},
    "GILA": { 2022: (pname) => pname.toUpperCase()},
    "GRAHAM": { 2022: (pname) => pname.toUpperCase()},
    "GREENLEE": { 2022: (pname) => removeNumsFromFront(pname)},
    "LA PAZ": { 2022: (pname) => removeNumsFromFront(pname)},
    "MARICOPA": { 2022: (pname) => pname.toUpperCase()},
    "MOHAVE": { 2022: (pname) => pname.toUpperCase()},
    "NAVAJO": { 2022: (pname) => removeNumsFromFront(pname)},
    "PIMA": { 2022: (pnum) => "PRECINCT " + pnum.padStart(3, "0")},
    "PINAL": { 2022: (pname) => pname.toUpperCase()},
    "SANTA CRUZ": { 2022: (pname) => pname.toUpperCase()},
    "YAVAPAI": { 2022: (pname) => pname.toUpperCase()},
    "YUMA": { 2022: (pname) => {
      if (pname.length >= 3) {
        pname = pname.slice(0, pname.indexOf("01"));
      }
      return "PRECINCT " + pname.padStart(3, "0")
    }}
  }
  
  const removeNumsFromFront = (str, hasHyphen = false) => {
    str = hasHyphen ? str.split("-") : str.split(" ");
    str.shift();
    return str.join(" ").toUpperCase()
  }