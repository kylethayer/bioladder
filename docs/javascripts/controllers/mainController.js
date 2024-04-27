import findOrCreateTaxon from '../models/allTaxa.js'

function navigateToTaxon(taxonName){
    console.log("navigating to taxon" + taxonName)
    findOrCreateTaxon(taxonName)
    // TODO: main view navigation

}

export default navigateToTaxon
