import findOrCreateTaxon from '../models/allTaxa.js'
import {gotoTaxon, d3Update} from '../views/taxaView.js'

function navigateToTaxonViaUrl(taxonName){
    window.location.hash = "#"+taxonName;
}


function navigateToTaxon(taxonName){
    console.log("navigating to taxon" + taxonName)
    let newTargetTaxon = findOrCreateTaxon(taxonName)
    gotoTaxon(newTargetTaxon)
}

export {navigateToTaxon, navigateToTaxonViaUrl, d3Update}
