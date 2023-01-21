import './style.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import {fromLonLat} from 'ol/proj.js';
import {Fill, Stroke, Style} from 'ol/style.js'

import {pnameConversionChart, partyColors} from './util'

// 'npm start' for live server in browser
let year = 2022;
let contest_arr = ["GOVERNOR", "U.S. SENATOR", "ATTORNEY GENERAL"]
let defaultContest = "GOVERNOR";
let selectedContest = defaultContest;
let contestsAreDisplayed = false;
let elec_results;

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
  visible: true,
  title: '2022 AZ Precincts'
});

map.addLayer(AZPrecincts);



// ################################

(function initializeContestName() {
  const contest_ele = document.getElementById('contest-name')
  contest_ele.innerHTML = defaultContest;
})()

function changeContestName(newContest) {
  const contest_ele = document.getElementById('contest-name')

  contest_ele.innerHTML = newContest;
}

const calculateVotingWeight = (contest) => {
  let total = contest.total;
  let demVotes, repVotes
  for (const cand of contest.candidates) {
    if (cand.party == "DEM") demVotes = cand.votes;
    if (cand.party == "REP") repVotes = cand.votes;
    continue;
  }
  const metric = ((demVotes - repVotes)/total) * 100;
  return metric
}

const getPartyColor = (weight) => {
  let clr;
  if (weight > 0) {
    if (weight >= 15) clr = partyColors["DEMOCRATIC"]
    else if (weight >= 5 && weight < 15) clr = partyColors["DEMOCRATIC_BRIGHT"]
    else clr = partyColors["DEMOCRATIC_BRIGHT_NEUTRAL"]
  } else if (weight < 0) {
    if (weight <= -15) clr = partyColors["REPUBLICAN"]
    else if (weight > -15 && weight <= -5) clr = partyColors["REPUBLICAN_BRIGHT"]
    else clr = partyColors["REPUBLICAN_BRIGHT_NEUTRAL"]
  }
  return clr;
}

const colorizePrecincts = (contestName) => {
  const precinctSource = AZPrecincts.getSource();
    if (precinctSource.getState() === 'ready') {
      const features = precinctSource.getFeatures();
      features.forEach((f) => {
        let {County: county, pct_num: code, pct_name: pname} = f.values_;
        county = county.toUpperCase();
        pname = county == 'COCONINO' 
          ? pnameConversionChart[county][year](pname, code) 
          : county == 'PIMA' ? pnameConversionChart[county][year](code) 
          : pnameConversionChart[county][year](pname);


        let metric, clr;
        try {
          metric = calculateVotingWeight(elec_results[county][pname]["contests"][contestName])
          clr = getPartyColor(Number(metric))
        } catch(e) {console.error(e)}

        let newStyle = new Style({
          fill: new Fill({
            color: clr
          }),
          stroke: new Stroke({
            color: "white"
          })
        })
        f.setStyle(newStyle);
      })
    }
}

const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(255, 255, 255, 0.7)',
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
    //

    pname = county == 'COCONINO' ? pnameConversionChart[county][year](pname, code) 
      : county == 'PIMA' ? pnameConversionChart[county][year](code) 
      : pnameConversionChart[county][year](pname);

    county_ele.innerHTML = county
    symbol_ele.innerHTML = "::"
    pname_ele.innerHTML = pname || '&nbsp;';

    const prec_obj = getPrecinctVotes(county, pname);
    const curr_contest = selectedContest || defaultContest;
    getAndWriteCandidates(prec_obj, county, pname, curr_contest);
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

const getAndWriteCandidates = (prec_obj, county, pname, contest) => {
  const votes_box = document.getElementById('votes-cont')
  if (votes_box.hasChildNodes()) {
    votes_box.innerHTML = ''
  }
  const tot_votes_ele = document.getElementById("tot-votes");
  const curr_contest = prec_obj["contests"][contest] || {}
  tot_votes_ele.innerHTML = curr_contest["total"]

  curr_contest.candidates?.forEach((cand) => {
    const candLine = document.createElement("span")
    candLine.setAttribute('class', 'cand-line')
    const candName = document.createElement("span")
    candName.innerHTML = cand.name
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
      changeContestName(contest.innerHTML);
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