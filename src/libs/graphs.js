/** @module graphs */

/*
 * Graphing functions (shared between calibration, scenarios, and optimization)
 */

import utils from './utils.js'
import rpcs from './rpc-service.js'
import status from './status-service.js'
import mpld3 from 'mpld3'

function placeholders(vm, startVal) {
  let indices = []
  if (!startVal) {
    startVal = 0
  }
  for (let i = startVal; i <= 100; i++) {
    indices.push(i);
    vm.showGraphDivs.push(false);
    vm.showLegendDivs.push(false);
  }
  return indices;
}

/**
 * Remove the figures that have been plotted in a Vue component
 *
 * @function
 * @param {Object} vm - Vue component 
 */
function clearGraphs(vm) {
  for (let index = 0; index <= 100; index++) {
    let divlabel = 'fig' + index;
    if (typeof d3 === 'undefined'){
      console.log("please include d3 to use the clearGraphs function")
      return false;
    }

    mpld3.remove_figure(divlabel);
    vm.hasGraphs = false
  }
}

/**
 * Use the mpld3 graph definitions to plot graphs in a Vue component 
 *
 * @function
 * @param {Object} vm - Vue component 
 * @param {Object} data - The mpld3 object that defines the graphs 
 * @param {string} routepath - The path that the  
 */
async function makeGraphs(vm, data, routepath) {
  if (typeof d3 === 'undefined'){
    console.log("please include d3 to use the makeGraphs function")
    return false;
  }

  // Don't render graphs if we've changed page
  if (routepath && routepath !== vm.$route.path) { 
    console.log('Not rendering graphs since route changed: ' + routepath + ' vs. ' + vm.$route.path)
    return false;
  }

  let waitingtime = 0.5
  var graphdata = data.graphs
  // var legenddata = data.legends

  // Start indicating progress.
  status.start(vm)

  vm.hasGraphs = true
  await utils.sleep(waitingtime * 1000);

  let n_plots = graphdata.length
  // let n_legends = legenddata.length

  console.log('Rendering ' + n_plots + ' graphs')

  // if (n_plots !== n_legends) {
  //   console.log('WARNING: different numbers of plots and legends: ' + n_plots + ' vs. ' + n_legends)
  // }

  for (var index = 0; index <= n_plots; index++) {
    console.log('Rendering plot ' + index);
    var figlabel = 'fig' + index;

    var figdiv  = document.getElementById(figlabel); 
    if (!figdiv) {
      console.log('WARNING: figdiv not found: ' + figlabel)
    }

    // Show figure containers
    if (index>=1 && index < n_plots) {
      var figcontainerlabel = 'figcontainer' + index

      // CK: Not sure if this is necessary? To ensure the div is clear first
      var figcontainerdiv = document.getElementById(figcontainerlabel); 
      if (figcontainerdiv) {
        figcontainerdiv.style.display = 'flex'
      } else {
        console.log('WARNING: figcontainerdiv not found: ' + figcontainerlabel)
      }

      // var legendlabel = 'legend' + index
      // var legenddiv  = document.getElementById(legendlabel);
      // if (legenddiv) {
      //   while (legenddiv.firstChild) {
      //     legenddiv.removeChild(legenddiv.firstChild);
      //   }
      // } else {
      //   console.log('WARNING: legenddiv not found: ' + legendlabel)
      // }
    }

    // Draw figures
    try {
      mpld3.draw_figure(figlabel, graphdata[index], function (fig, element) {
        fig.setXTicks(6, function (d) {
          return d3.format('.0f')(d);
        });
        // fig.setYTicks(null, function (d) { // Looks too weird with 500m for 0.5
        //   return d3.format('.2s')(d);
        // });
      }, true);
    } catch (error) {
      console.log('Could not plot graph: ' + error.message)
    }

    // Draw legends
    // if (index>=1 && index<n_plots) {
    //   try {
    //     mpld3.draw_figure(legendlabel, legenddata[index], function (fig, element) {
    //     });
    //   } catch (error) {
    //     console.log(error)
    //   }
    //
    // }
    vm.showGraphDivs[index] = true;
  }

  // CK: This should be a promise, otherwise this appears before the graphs do
  status.succeed(vm, 'Graphs created') 
}

//
// Graphs DOM functions
//

/**
 * Print the dimentions of the current window to the console 
 *
 * @function
 */
function showBrowserWindowSize() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  let ow = window.outerWidth; //including toolbars and status bar etc.
  let oh = window.outerHeight;
  console.log('Browser window size:')
  console.log(w, h, ow, oh)
}

/**
 * Given an SVG HTML element in the DOM scale its size 
 *
 * @function
 * @svg {Object} svg - The HTML element of the SVG 
 * @frac {number} frac - The fraction which the SVG figure should be scaled by 
 */
function scaleElem(svg, frac) {
  // It might ultimately be better to redraw the graph, but this works
  let width  = svg.getAttribute("width")
  let height = svg.getAttribute("height")
  let viewBox = svg.getAttribute("viewBox")
  if (!viewBox) {
    svg.setAttribute("viewBox",  '0 0 ' + width + ' ' + height)
  }
  // if this causes the image to look weird, you may want to look at "preserveAspectRatio" attribute
  svg.setAttribute("width",  width*frac)
  svg.setAttribute("height", height*frac)
}

/**
 * Scale all the figures inside a Vue component instance 
 *
 * @function
 * @param {Object} vm - Vue component 
 * @frac {number} frac - The fraction which the SVG figures should be scaled by 
 */
function scaleFigs(vm, frac) {
  vm.figscale = vm.figscale*frac;
  if (frac === 1.0) {
    frac = 1.0/vm.figscale
    vm.figscale = 1.0
  }
  let graphs = window.top.document.querySelectorAll('svg.mpld3-figure')
  for (let g = 0; g < graphs.length; g++) {
    scaleElem(graphs[g], frac)
  }
}


//
// Legend functions
// 


/**
 * Add a native mouseover listener to a Vue component instance. 
 * It will update the variables `.mousex` and `.mousey` inside the instance
 *
 * @function
 * @param {Object} vm - Vue component 
 */
function addListener(vm) {
  document.addEventListener('mousemove', function(e){onMouseUpdate(e, vm)}, false);
}

/**
 * Pass the position of the mouse to a Vue component instance 
 *
 * @function
 * @private
 * @param {Object} e - Event object 
 * @param {Object} vm - Vue component 
 */
function onMouseUpdate(e, vm) {
  vm.mousex = e.pageX;
  vm.mousey = e.pageY;
  // console.log(vm.mousex, vm.mousey)
}

function createDialogs(vm) {
  let vals = placeholders(vm)
  for (let val in vals) {
    newDialog(vm, val, 'Dialog '+val, 'Placeholder content '+val)
  }
}

// Create a new dialog
function newDialog(vm, id, name, content) {
  let options = {left:123+Number(id), top:123}
  let style = {options:options}
  let properties = { id, name, content, style, options }
  return vm.openDialogs.push(properties)
}

function findDialog(vm, id, dialogs) {
  console.log('looking')
  let index = dialogs.findIndex((val) => {
    return String(val.id) === String(id) // Force type conversion
  })
  return (index > -1) ? index : null
}

// "Show" the dialog
function maximize(vm,id) {
  let index = Number(id)
  let DDlabel = 'DD'+id // DD for dialog-drag
  let DDdiv  = document.getElementById(DDlabel);
  if (DDdiv) {
    DDdiv.style.left = String(vm.mousex-80) + 'px'
    DDdiv.style.top = String(vm.mousey-300) + 'px'
  } else {
    console.log('WARNING: DDdiv not found: ' + DDlabel)
  }
  if (index !== null) {
    vm.openDialogs[index].options.left = vm.mousex-80 // Before opening, move it to where the mouse currently is
    vm.openDialogs[index].options.top = vm.mousey-300
  }
  vm.showLegendDivs[index] = true // Not really used, but here for completeness
  let containerlabel = 'legendcontainer'+id
  let containerdiv  = document.getElementById(containerlabel);
  if (containerdiv) {
    containerdiv.style.display = 'inline-block' // Ensure they're invisible
  } else {
    console.log('WARNING: containerdiv not found: ' + containerlabel)
  }
}

// "Hide" the dialog
function minimize(vm, id) {
  let index = Number(id)
  vm.showLegendDivs[index] = false
  let containerlabel = 'legendcontainer'+id
  let containerdiv  = document.getElementById(containerlabel);
  if (containerdiv) {
    containerdiv.style.display = 'none' // Ensure they're invisible
  } else {
    console.log('WARNING: containerdiv not found: ' + containerlabel)
  }
}

export default {
  placeholders,
  clearGraphs,
  makeGraphs,
  scaleFigs,
  showBrowserWindowSize,
  addListener,
  onMouseUpdate,
  createDialogs,
  newDialog,
  findDialog,
  maximize,
  minimize,
  mpld3
}
