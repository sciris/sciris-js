/*
 * Heftier functions that are shared across pages
 */

import rpcs from './rpc-service.js'
import status from './status-service.js'

function updateSets(vm) {
  return new Promise((resolve, reject) => {
    console.log('updateSets() called')
    rpcs.rpc('get_parset_info', [vm.projectID]) // Get the current user's parsets from the server.
      .then(response => {
        vm.parsetOptions = response.data // Set the scenarios to what we received.
        if (vm.parsetOptions.indexOf(vm.activeParset) === -1) {
          console.log('Parameter set ' + vm.activeParset + ' no longer found')
          vm.activeParset = vm.parsetOptions[0] // If the active parset no longer exists in the array, reset it
        } else {
          console.log('Parameter set ' + vm.activeParset + ' still found')
        }
        vm.newParsetName = vm.activeParset // WARNING, KLUDGY
        console.log('Parset options: ' + vm.parsetOptions)
        console.log('Active parset: ' + vm.activeParset)
        rpcs.rpc('get_progset_info', [vm.projectID]) // Get the current user's progsets from the server.
          .then(response => {
            vm.progsetOptions = response.data // Set the scenarios to what we received.
            if (vm.progsetOptions.indexOf(vm.activeProgset) === -1) {
              console.log('Program set ' + vm.activeProgset + ' no longer found')
              vm.activeProgset = vm.progsetOptions[0] // If the active parset no longer exists in the array, reset it
            } else {
              console.log('Program set ' + vm.activeProgset + ' still found')
            }
            vm.newProgsetName = vm.activeProgset // WARNING, KLUDGY
            console.log('Progset options: ' + vm.progsetOptions)
            console.log('Active progset: ' + vm.activeProgset)
            resolve(response)
          })
          .catch(error => {
            status.fail(this, 'Could not get progset info', error)
            reject(error)
          })
      })
      .catch(error => {
        status.fail(this, 'Could not get parset info', error)
        reject(error)
      })
  })
    .catch(error => {
      status.fail(this, 'Could not get parset info', error)
      reject(error)
    })
}

function exportGraphs(vm) {
  return new Promise((resolve, reject) => {
    console.log('exportGraphs() called')
    rpcs.download('download_graphs', [vm.$store.state.currentUser.username])
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        status.fail(vm, 'Could not download graphs', error)
        reject(error)
      })
  })
}

function exportResults(vm, serverDatastoreId) {
  return new Promise((resolve, reject) => {
    console.log('exportResults()')
    rpcs.download('export_results', [serverDatastoreId, vm.$store.state.currentUser.username])
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        status.fail(vm, 'Could not export results', error)
        reject(error)
      })
  })
}

function updateDatasets(vm) {
  return new Promise((resolve, reject) => {
    console.log('updateDatasets() called')
    rpcs.rpc('get_dataset_keys', [vm.projectID]) // Get the current user's datasets from the server.
      .then(response => {
        vm.datasetOptions = response.data // Set the scenarios to what we received.
        if (vm.datasetOptions.indexOf(vm.activeDataset) === -1) {
          console.log('Dataset ' + vm.activeDataset + ' no longer found')
          vm.activeDataset = vm.datasetOptions[0] // If the active dataset no longer exists in the array, reset it
        } else {
          console.log('Dataset ' + vm.activeDataset + ' still found')
        }
        vm.newDatsetName = vm.activeDataset // WARNING, KLUDGY
        console.log('Datset options: ' + vm.datasetOptions)
        console.log('Active dataset: ' + vm.activeDataset)
      })
      .catch(error => {
        status.fail(this, 'Could not get dataset info', error)
        reject(error)
      })
  })
}

export default {
  updateSets,
  updateDatasets,
  exportGraphs,
  exportResults,
}
