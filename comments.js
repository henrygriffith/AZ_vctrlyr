// const initialSQL = `
//   SELECT 
//     UPPER(precinct) AS pname, 
//     ROUND(AVG(CASE WHEN race!='Caucasian' THEN 1.0 ELSE 0 END), 2) AS pocPerc, 
//     ROUND(AVG(vci), 2) AS avg_vci, COUNT(vanid) AS pop, 
//     con_dist AS CD, 
//     hse_dist AS LD, 
//     UPPER(county) AS county
//   FROM univoters
//   GROUP BY pname
// `


//in initialize app: 
// get(initialSQL, '/')
  //   .then((res) => {
  //     console.log("ok...request came back now...")
  //     console.log("starting siphon: ")
  //     generatePrecObjs(res.data)
  //     console.log("done siphoning universe!")
  //     console.log("....aaaaaand here it is: ")
  //   })

  // function generatePrecObjs(dataset) {
//   dataset.forEach((row) => {
//     let {pname, pocPerc, avg_vci, pop, CD, LD, county} = row
//     pname = pnameConversionChart[county][year](pname)

//     if (!precincts.hasOwnProperty(pname)) precincts[pname] = {}
//       precincts[pname].name = pname
//       precincts[pname].county = county
//       precincts[pname].poc_perc = pocPerc
//       precincts[pname].avg_vci = avg_vci
//       precincts[pname].universe_pop = pop
//       precincts[pname].CD = CD
//       precincts[pname].LD = LD
//   })
// }

// function displayPrecinctDetailModal(pname) {
//   const precObj = precincts[pname]
//   const modal = document.getElementById("prec-modal")
//   if (precObj) {
//     console.log('setting to block')
//     modal.style.display = 'block';
//     setHTMLforModal(precObj)
//   } 
// }

// function setHTMLforModal(precObj) {
//   const { name, universe_pop, avg_vci, CD, LD } = precObj

//   document.getElementById('udata_pname').textContent = name
//   document.getElementById('udata_cd').textContent = "CD: " + CD
//   document.getElementById('udata_ld').textContent = "LD: " + LD
//   document.getElementById('udata_vci').textContent = avg_vci
//   document.getElementById('udata_pop').textContent = universe_pop
// } 

// function handleDataModeChange() {
//   electioning = !electioning

//   const mapPage = document.getElementById('main-cont')
//   const canvassPage = document.getElementById('side-cont')
//   const datamodeToggle = document.getElementById('datamode-toggle')

//   if (electioning)  {
//     mapPage.style.display="flex"
//     canvassPage.style.display="none"

//     datamodeToggle.classList.remove('red')
//     datamodeToggle.classList.add('blue')
//     datamodeToggle.textContent = "Election Results"
//   } else {
//     mapPage.style.display="none"
//     canvassPage.style.display="flex"

//     datamodeToggle.classList.remove('blue')
//     datamodeToggle.classList.add('red')
//     datamodeToggle.textContent = "Canvassing"
//   }
// }

// function handleUniverseSelectChange() {
//   const colorMode = document.getElementById('univ-select').value;
//   engageThrusters(colorMode)
//   map.getView().animate({center: fromLonLat([-112.4, 33.5])}, {zoom: 9.75})
// }

// global scope: 
// const featureOverlay = new VectorLayer({
//   source: new VectorSource(),
//   map: map,
//   style: new Style({
//     stroke: new Stroke({
//       color: 'rgba(255, 255, 255, 1)',
//       width: 2,
//     }),
//   }),
// })


//in display feature info
  // if (feature !== highlight) {
  //   if (highlight) {
  //     featureOverlay.getSource().removeFeature(highlight);
  //   }
  //   if (feature) {
  //     featureOverlay.getSource().addFeature(feature);
  //   }
  //   highlight = feature;
  // }


//   <div id="prec-modal" class="ui segments">
//           <div id="modal-pname" class="ui segment">
//             <h3 id="udata_pname" class="ui header">RED BUTTE</h3>
//           </div>
//             <div class="ui horizontal segments">
//               <div class="ui segment compact black">
//                 <div class="ui mini grey statistic">
//                   <div id="udata_cd" class="value">CD: 6</div>
//                 </div>
//               </div>
//               <div class="ui segment compact black">
//                 <div class="ui mini grey statistic">
//                   <div id="udata_ld" class="value">LD: 21</div>
//                 </div>
//               </div>
//             </div>
//             <div class="ui segment green">
//                 <div class="ui mini blue statistic">
//                   <div class="label">Average VCI</div>
//                   <div id="udata_vci" class="value">
//                     <i class="clipboard icon"></i>
//                     80.75
//                   </div>
//                 </div>
//                 <div class="ui mini green statistic">
//                   <div class="label">Universe Pop.</div>
//                   <div id="udata_pop" class="value">
//                     <i class="user icon"></i>
//                     4,200
//                   </div>
                  
//                 </div>
//             </div>
//         </div>