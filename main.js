import './style.css';
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
import Point from 'ol/geom/Point.js';
import Feature from 'ol/Feature.js'

import {pnameConversionChart, partyColors} from './util';

// 'npm start' for live server in browser
let year = 2022;
let contest_arr = ["GOVERNOR", "U.S. SENATOR", "ATTORNEY GENERAL"]
let defaultContest = contest_arr[0];
let selectedContest = defaultContest;
let contestsAreDisplayed = false;
let elec_results;
const LOW_VOTE_COUNT_THRESHOLD = 1000;

// let standardBlue = [0, 125, 237]
// let standardRed = [227, 51, 61];

let standardBlue = [0, 0, 255];
let standardRed = [255, 0, 0];


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
  style: new Style({
    fill: new Fill({
      color: 'red',
    }),
    stroke: new Stroke({
      color: 'charcoal',
    }),
  }),
  title: '2022 AZ Precincts'
});

map.addLayer(AZPrecincts);
// ################################


(function initializeContestName() {
  document.getElementById('contest-name').innerHTML = defaultContest;
})()

function initializeListeners() {
  const select = document.getElementById('visual-select')
  const alphaBtn = document.getElementById('alpha-btn')

  select.addEventListener('change', handleSelectChange)
  alphaBtn.addEventListener('click', handleAlphaBtn)
  
}
initializeListeners()

function setContestName(contest) {
  document.getElementById('contest-name').innerHTML = contest;
}

const calculateVotingWeight = (contest, isContinuous) => {
  const {total, candidates} = contest;
  let demVotes, repVotes;
  for (const cand of candidates) {
    if (cand.party == "DEM") demVotes = cand.votes;
    if (cand.party == "REP") repVotes = cand.votes;
  }

  const basic_metric = (((demVotes - repVotes)/total) * 100).toFixed(2);
  const ranged_metric = (demVotes/total).toFixed(2);

  return isContinuous ? ranged_metric : basic_metric;
}

const getQuantizedPartyColor = (weight) => {
  let clr;

  if (weight > 0) {
    clr = weight >= 22.5 ? partyColors["DEMOCRATIC"]
      : (weight >= 10 && weight < 22.5) ? partyColors["DEMOCRATIC_BRIGHT"]
      : partyColors["DEMOCRATIC_BRIGHT_NEUTRAL"]
  } else if (weight < 0) {
    clr = weight <= -15 ? partyColors["REPUBLICAN"] 
      : (weight > -15 && weight <= -10) ? partyColors["REPUBLICAN_BRIGHT"] 
      : partyColors["REPUBLICAN_BRIGHT_NEUTRAL"]
  }
  return clr;
}

const getContinuousPartyColor = (weight, totalVotes) => {
   let [r, g, b] = interpolateColor(standardRed, standardBlue, weight) 
   return alphaOn ? `rgba(${r}, ${g}, ${b}, ${getAlphaValue(totalVotes, LOW_VOTE_COUNT_THRESHOLD)})` : `rgb(${r}, ${g}, ${b})`
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

let isContinuous = false;
let alphaOn = false;

const colorizePrecincts = (contestName) => {
  const precinctSource = AZPrecincts.getSource();
    if (precinctSource.getState() === 'ready') {
      precinctSource.getFeatures().forEach((f) => {
        let {County: county, pct_num: pnum, pct_name: pname} = f.values_;
        county = county.toUpperCase();
        pname = pnameConversionChart[county][year](pname, pnum)
        if (pname == undefined) return;
        let metric, clr;
        try {
          metric = calculateVotingWeight(elec_results[county][pname]["contests"][contestName], isContinuous)
          clr = isContinuous ? getContinuousPartyColor(metric, elec_results[county][pname]["contests"][contestName].total) : getQuantizedPartyColor(metric)
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

const circlify = () => {
  const precinctSource = AZPrecincts.getSource();
    if (precinctSource.getState() === 'ready') {
      precinctSource.getFeatures().forEach((f) => {
        const polygon = f.getGeometry().getExtent();
        const center = ol.extent.getCenter(polygon);

        const pointFeature = new Feature({
          geometry: new Point(center, 'XY')
        })

        pointFeature.setStyle(new Style({
          stroke: new Stroke({
            color: 'rgb(0, 0, 255)'
          }),
          fill: new Fill({
            fill: 'yellow'
          })
        }))

        console.log(pointFeature)
      f.setStyle(new Style({
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 1)',
        })
      }))
      })
    }
}

function handleSelectChange() {
  const val = document.getElementById('visual-select').value;
  if (val === "CONTINUOUS BASIC") {
    isContinuous = true;
    colorizePrecincts(selectedContest)
  }
  else if (val === "BASIC") {
    isContinuous = false;
    colorizePrecincts(selectedContest)
  }
  else if (val === "POPULATION DENSITY CIRCLES") {
    isContinuous = false;
    circlify();
  }

  
}

function handleAlphaBtn() {
  alphaOn = !alphaOn

  colorizePrecincts(selectedContest)
}

function getAlphaValue(total_votes, threshold, minAlpha = .4, maxAlpha = 1) {
  if (total_votes >= threshold) return 1

 return minAlpha + (maxAlpha - minAlpha)  * (total_votes / threshold)
}

const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(255, 255, 255, 1)',
      width: 2,
    }),
  }),
})

let highlight;
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

    const poly = feature.getGeometry().getExtent();
    const what = ol.extent.getCenter(poly)
    console.log('center?: ',what)

  }

  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
}

const getPrecinctVotes = (county, pname) => {
  return elec_results[county][pname]
};

const getAndWriteCandidates = (prec_obj, contest) => {
  const votes_box = document.getElementById('votes-cont')
  if (votes_box.hasChildNodes()) votes_box.innerHTML = ''
  const curr_contest = prec_obj["contests"][contest] || {}
  const tot_votes_ele = document.getElementById("tot-votes");
  tot_votes_ele.innerHTML = curr_contest["total"]

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
    const contest = document.createElement('span')
    contest.innerHTML = cont_name;
    contest.setAttribute('class', 'contest');

    contest.addEventListener('click', function() {
      setContestName(contest.innerHTML);
      selectedContest = contest.innerHTML;

      // When the contest is clicked/changed, recalculate colors (probably would cache these)
      colorizePrecincts(cont_name)
    })
    contestContainer.appendChild(contest)
  }
  console.log("CONTESTS DISPLAYED AND EQUIPPED WITH EVENT LISTENERS")
}



// ############ EVENTS #############
map.on('loadstart', async function(evt){
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
});

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
  
})

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
})