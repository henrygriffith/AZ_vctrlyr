// import '/style.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import {fromLonLat} from 'ol/proj.js';
import {Fill, Stroke, Style} from 'ol/style.js';
import Circle from 'ol/geom/Circle.js';
import Feature from 'ol/Feature.js'

import {pnameConversionChart} from './util.js';

let window2;

let year = 2022;
let contest_arr = ["GOVERNOR", "U.S. SENATOR", "ATTORNEY GENERAL"]
const LOW_VOTE_COUNT_THRESHOLD = 1000;
const PARTY_VOTE_DISTRIB_UPPER = 0.4;

let STANDARD_BLUE = [0, 0, 255];
let STANDARD_RED = [255, 0, 0];
let DEMOCRATIC_RGB = [0, 125, 237];
let DEMOCRATIC_NEUTRAL_RGB = [174, 188, 208]
let REPUBLICAN_RGB = [227, 51, 61, 1]
let REPUBLICAN_NEUTRAL_RGB = [255, 115, 112]
let LIBERTARIAN_RGB = [247, 212, 71]
let LIBERTARIAN_NEUTRAL_RGB = [255, 255, 231]

let defaultContest = contest_arr[0];
let selectedContest = defaultContest;
let selectedColorMode = "BASIC"
let contestsAreDisplayed = false;
let alfing = false;
let circling = false;

let electioning = true;
let elec_results;
let precincts = {}
let highlight;

// ############# LAYERS ##############
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: fromLonLat([-112, 34]),
    zoom: 7,
  }),
});

const AZPrecincts = new VectorLayer({
  source: new VectorSource({
    url: './data/ts-updated-az-precinct-shape-file_aug2022.geojson',
    format: new GeoJSON(),
  }),
  map: map,
  style: new Style({
  
    stroke: new Stroke({
      color: 'charcoal',
    }),
  }),
  title: '2022 AZ Precincts'
});


let circles = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(0, 255, 0, 1)',
      width: 1
    }),
    fill: new Fill({
      color: 'rgba(0, 255, 255, .75)',
    }),
  })
})
// ################################

export const get = async (sql, url = '/') => {
  const response = await fetch("http://localhost:8000" + url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({sql})
  })
  const data = await response.json();
  return data
}

function loadInitialData() {
  let window2 = window.open('/index2.html')
  globalThis.win2 = window2
  fetch('./data/er2022.json')
    .then((response) => response.json())
    .then((json) => {
      elec_results = json
    }).then(() => {
      if (contestsAreDisplayed === false) {
        displayContests();
        contestsAreDisplayed = true;
      }
  });
  console.log('loadinitialdata called')
}

function initializeApp() {
  document.getElementById('contest-name').innerHTML = defaultContest;
  const select = document.getElementById('visual-select')
  const alphaBtn = document.getElementById('alpha-btn')
  const circlesBtn = document.getElementById('circles-btn')

  select.addEventListener('change', handleSelectChange)
  alphaBtn.addEventListener('click', handleAlphaBtn)
  circlesBtn.addEventListener('click', handleCirclesButton)

  colorizePrecincts(defaultContest)
  console.log('initializeApp called')
}

function setContestName(contest) {
  document.getElementById('contest-name').innerHTML = contest;
  selectedContest = contest;
}

const getDemPercentage = (contest) => {
  const {total, candidates} = contest;
  let demVotes = 0
  for (const cand of candidates) 
    if (cand.party == "DEM") demVotes += cand.votes

  return (demVotes/total).toFixed(2);
}

const getOverallPartyPercentage = (contests, contestName, party) => {
  const { candidates } = contests[contestName]
  const contestTotal = elec_results.OVERALL[contestName][party]
  let partyVotes = 0;

  for (const cand of candidates)
    if (cand.party === party) partyVotes += Number(cand.votes)

  const ratioOfTotal = ((partyVotes / contestTotal) * 100).toFixed(10)
  return ratioOfTotal
}

const getQuantizedPartyColor = (dp, totalVotes, alphaIsOn) => {
  let clr;
  let alf = alphaIsOn ? getAlphaValue(totalVotes, LOW_VOTE_COUNT_THRESHOLD) : 1
  if (dp > 0.5) {
    clr = dp >= 0.65 ? `rgba(0, 125, 237, ${alf})`
      : (dp >= 0.55 && dp < .65) ? `rgba(99, 178, 255, ${alf})`
      : `rgba(174, 188, 208, ${alf})`
  } else if (dp < 0.5) {
    clr = dp <= 0.35 ? `rgba(227, 51, 61, ${alf})`
      : (dp > 0.35 && dp <= 0.45) ? `rgba(204, 167, 163, ${alf})` 
      : `rgba(255, 115, 112, ${alf})`
  }
  return clr;
}

const getContinuousPartyColor = (dp, totalVotes, alpha) => {
   let [r, g, b] = interpolateColor(STANDARD_RED, STANDARD_BLUE, dp) 
   return alpha ? `rgba(${r}, ${g}, ${b}, ${getAlphaValue(totalVotes, LOW_VOTE_COUNT_THRESHOLD)})` : `rgb(${r}, ${g}, ${b})`
}

const getColorForSpecificPartyDistrib = (party, val, upperRange) => {
  let r, g, b;
  if (party == "DEM")
    [r, g, b] = interpolateColor(DEMOCRATIC_NEUTRAL_RGB, DEMOCRATIC_RGB, val/upperRange)
  else if (party == "REP")
    [r, g, b] = interpolateColor(REPUBLICAN_NEUTRAL_RGB, REPUBLICAN_RGB, val/upperRange)
  else if (party == "LBT")
    [r, g, b] = interpolateColor(LIBERTARIAN_NEUTRAL_RGB, LIBERTARIAN_RGB, val/upperRange)


  console.log(r, g, b)
   return `rgba(${r}, ${g}, ${b}, 1)`
}

const getHowGreen = (pocPerc) => {
  return interpolateColor([255, 255, 255], [0, 100, 0], pocPerc)
}

// red to blue
const interpolateColor = (c1, c2, val) => {
  let [rdem, gdem, bdem] = c1;
  let [rrep, grep, brep] = c2;

  let lerpr = rdem + (rrep - rdem) * val;
  let lerpg = gdem + (grep - gdem) * val;
  let lerpb = bdem + (brep - bdem) * val;

  return [lerpr, lerpg, lerpb]
}

const colorizePrecincts = (contestName, requestedType = "BASIC", alphaIsOn = false) => {
  const precinctSource = AZPrecincts.getSource();
    if (precinctSource.getState() === 'ready') {
      precinctSource.getFeatures().forEach((f) => {
        let {County: county, pct_num: pnum, pct_name: pname} = f.values_;
        county = county.toUpperCase();
        pname = pnameConversionChart[county][year](pname, pnum)

        // if we can't find pname, iterate.
        if (pname == undefined) return;
        let metric, clr;
        
        const forks = {
          "metrics": {
            "BASIC": (contests, contestName) => getDemPercentage(contests[contestName]),
            "CONTINUOUS BASIC": (contests, contestName) => getDemPercentage(contests[contestName]),
            "DEM DISTRIBUTION": (contests, contestName) => getOverallPartyPercentage(contests, contestName, "DEM"),
            "REP DISTRIBUTION": (contests, contestName) => getOverallPartyPercentage(contests, contestName, "REP"),
            "LBT DISTRIBUTION": (contests, contestName) => getOverallPartyPercentage(contests, contestName, "LBT"),
          },
          "colors": {
            "BASIC": (metric, total) => getQuantizedPartyColor(metric, total, alphaIsOn),
            "CONTINUOUS BASIC": (metric, total) => getContinuousPartyColor(metric, total, alphaIsOn),
            "DEM DISTRIBUTION": (metric, total) => getColorForSpecificPartyDistrib(requestedType.split(' ')[0], metric, PARTY_VOTE_DISTRIB_UPPER),
            "REP DISTRIBUTION": (metric, total) => getColorForSpecificPartyDistrib(requestedType.split(' ')[0], metric, PARTY_VOTE_DISTRIB_UPPER),
            "LBT DISTRIBUTION": (metric, total) => getColorForSpecificPartyDistrib(requestedType.split(' ')[0], metric, PARTY_VOTE_DISTRIB_UPPER),
          }
        }
        try {
          const precinctContests = elec_results[county][pname]["contests"]
          metric = forks["metrics"][requestedType](precinctContests, contestName)
          clr = forks["colors"][requestedType](metric, precinctContests[contestName].total)
        } catch(e) {console.error(e)}

        f.setStyle(new Style({
          fill: new Fill({
            color: clr
          }),
          stroke: new Stroke({
            color: 'rgba(255, 255, 255, 1)',
          })
        }))
      })
    }
}

const circlify = (contestName) => {
  const precinctSource = AZPrecincts.getSource();
  const circlesSource = circles.getSource();

  if (!circling) {
    circlesSource.clear();
    return;
  }

  if (precinctSource.getState() === 'ready') {
    precinctSource.getFeatures().forEach((f) => {
      let {County: county, pct_num: pnum, pct_name: pname} = f.values_;
      county = county.toUpperCase();
      pname = pnameConversionChart[county][year](pname, pnum)
      if (pname == undefined) return;
      let radius = 750;
      try {
        const dem = elec_results[county][pname]["contests"][contestName].candidates.find((cand) => cand.party == "DEM")
        if (Number(dem.votes) >= 1500) radius = 2500
    
      } catch(e) {console.error(e)}

      const polygon = f.getGeometry().getExtent();
      const center = ol.extent.getCenter(polygon);

      const circleFeature = new Feature({
        geometry: new Circle(center, radius, 'XY')
      })

      circleFeature.setStyle(new Style({
        stroke: new Stroke({
          coor: 'rgb(0, 0, 0)'
        }),
        fill: new Fill({
          color: 'rgba(173, 216, 230, 0.75)'
        })
      }))
      circlesSource.addFeature(circleFeature)
    })
  }
}

function handleSelectChange() {
  const colorMode = document.getElementById('visual-select').value;
  selectedColorMode = colorMode;

  colorizePrecincts(selectedContest, colorMode, false);
}

function handleAlphaBtn() {
  const colorMode = document.getElementById('visual-select').value;
  alfing = !alfing

  colorizePrecincts(selectedContest, colorMode, alfing)
}

function handleCirclesButton() {
  circling = !circling
  circlify(selectedContest)
}

function getAlphaValue(total_votes, threshold, minAlpha = .4, maxAlpha = 1) {
  if (total_votes >= threshold) return 1

 return minAlpha + (maxAlpha - minAlpha)  * (total_votes / threshold)
}

const displayFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });
  const county_ele = document.getElementById("county-name");
  const symbol_ele = document.getElementById("symbol");
  const pname_ele = document.getElementById("prec-name");

  if (feature) {
    // From geometry file
    let county = feature.get('County').toUpperCase();
    let code = feature.get('pct_num');
    let pname = feature.get('pct_name')
    pname = pnameConversionChart[county][year](pname, code) 
      
    county_ele.innerHTML = county
    symbol_ele.innerHTML = "::"
    pname_ele.innerHTML = pname || '&nbsp;';

    const prec_obj = getPrecinctVotes(county, pname);
    const curr_contest = selectedContest || defaultContest;
    getAndWriteCandidates(prec_obj, curr_contest);
  }
}

const getPrecinctVotes = (county, pname) => {
  return elec_results[county][pname]
};

const engageThrusters = (requestedType = "PEOPLE OF COLOR") => {
  const forks = {
    "metrics": {
      "PEOPLE OF COLOR": (precObj) => precObj.poc_perc
    },
    "colors": {
      "PEOPLE OF COLOR": (metric) => getHowGreen(metric)
    }
  }

  const precinctSource = AZPrecincts.getSource();
    if (precinctSource.getState() === 'ready') {
      precinctSource.getFeatures().forEach((f) => {
        let {County: county, pct_num: pnum, pct_name: pname} = f.values_;
        pname = pnameConversionChart[county.toUpperCase()][year](pname, pnum)
        console.log(pname)
        let precObj = precincts[pname] || {}
        let metric, clr

        try {
          metric = forks["metrics"][requestedType](precObj)
          clr = forks["colors"][requestedType](metric)
        } catch(err) { }

        f.setStyle(new Style({
          fill: new Fill({
            color: clr
          }),
          stroke: new Stroke({
            color: 'rgba(255, 255, 255, 1)',
          })
        }))
      })
    }
  map.getView().animate({center: fromLonLat([-112.4, 33.5])}, {zoom: 9.75})
}

const getAndWriteCandidates = (prec_obj, contest) => {
  const votes_box = document.getElementById('votes-cont')
  if (votes_box.hasChildNodes()) votes_box.innerHTML = ''
  const curr_contest = prec_obj["contests"][contest] || {}
  const tot_votes_ele = document.getElementById("tot-votes");
  tot_votes_ele.innerHTML = curr_contest["total"] + ' votes'

  curr_contest.candidates?.forEach((cand) => {
    const candLine = document.createElement("span")
    candLine.setAttribute('class', 'cand-line')
    const candName = document.createElement("span")
    candName.innerHTML = cand.name + ' (' + cand.party + ')'
    const candVotesCont = document.createElement('div');
    const candVotes = document.createElement("span")
    candVotes.innerHTML = cand.votes
    const candPerc = document.createElement("span")
    candPerc.setAttribute('class', 'percentage')
    candPerc.innerHTML = `${(cand.votes / curr_contest["total"] * 100).toFixed(2)} %`

    candLine.appendChild(candName)
    candVotesCont.appendChild(candVotes)
    candVotesCont.appendChild(candPerc)
    candLine.appendChild(candVotesCont)
    votes_box.appendChild(candLine)
  })
}

const displayContests = () => {
  console.log("ATTEMPTING TO DISPLAY CONTESTS...")

  const contestContainer = document.getElementById('contest-select')
  for (const cont_name of contest_arr) {
    const contest = document.createElement('div')
    contest.innerHTML = cont_name;
    contest.setAttribute('class', 'contest');

    contest.addEventListener('click', function() {
      setContestName(contest.innerHTML);
      selectedContest = contest.innerHTML;

      const colorMode = document.getElementById('visual-select').value
      // When the contest is clicked/changed, recalculate colors (probably would cache these)
      colorizePrecincts(cont_name, colorMode, alfing)
    })
    contestContainer.appendChild(contest)
  }
  console.log("CONTESTS DISPLAYED AND EQUIPPED WITH EVENT LISTENERS")
}

// ############ EVENTS #############

map.on('loadstart', function(evt) {
  loadInitialData();
})
map.on('loadend', function(evt) {
  initializeApp();
})

map.on('click', function(event) {
  // event.stopPropagation();
  map.forEachFeatureAtPixel(event.pixel, function(feature) {
    let {County: county, pct_num: pnum, pct_name: pname} = feature.values_;
    pname = pnameConversionChart[county.toUpperCase()][year](pname, pnum)
    // displayPrecinctDetailModal(pname)
  })
})

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
  
})

document.addEventListener('keypress', function (e) {
  if (e.key === "a") {
    colorizePrecincts(selectedContest, selectedColorMode, alfing = !alfing);
  }
  if (e.key === "c") {
    handleCirclesButton()
  }
})
// ##############################