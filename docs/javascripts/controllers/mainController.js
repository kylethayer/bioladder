import findOrCreateTaxon from '../models/allTaxa.js'
import gotoTaxon from '../views/taxaView.js'

function navigateToTaxon(taxonName){
    console.log("navigating to taxon" + taxonName)
    let newTargetTaxon = findOrCreateTaxon(taxonName)
    gotoTaxon(newTargetTaxon)
}

export default navigateToTaxon
