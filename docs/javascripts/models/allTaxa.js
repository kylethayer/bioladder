import settings from "../settings.js"
import Taxon from "./taxon.js"

const allTaxaDictionary = {}


function findOrCreateTaxon(taxonName){
    if(!(taxonName in allTaxaDictionary)){
        allTaxaDictionary[taxonName] = new Taxon(taxonName)
    }
    return allTaxaDictionary[taxonName];
}

async function loadAllTaxa(){
    console.log("loading all taxa data")
    const allTaxaListResponse = await fetch(settings.data_url_base + "taxon_list.json")
    const allTaxaList = await allTaxaListResponse.json();
    allTaxaList.forEach(taxonName => {
        findOrCreateTaxon(taxonName);
    })
    console.log("all taxa data loaded", allTaxaDictionary)
}

loadAllTaxa()


export default findOrCreateTaxon