import settings from "../settings.js"
import Taxon from "./taxon.js"

const allTaxaDictionary = {}


function findOrCreateTaxon(taxonName){
    if(!(taxonName in allTaxaDictionary)){
        taxonName = taxonName.toLowerCase()
        allTaxaDictionary[taxonName] = new Taxon(taxonName)
    }
    return allTaxaDictionary[taxonName];
}

async function loadAllTaxa(){
    //console.log("loading all taxa data")
    const allTaxaListResponse = await fetch(settings.data_url_base + "taxon_search_list.csv")
    const allTaxaCsv = await allTaxaListResponse.text();
    const allTaxaList = d3.dsvFormat(",").parse(allTaxaCsv)
    allTaxaList.forEach(taxonInfo => {
        let taxon = findOrCreateTaxon(taxonInfo.name);
        if(taxonInfo.otherNames){
            taxon.otherNames = JSON.parse(taxonInfo.otherNames)
        }
        if(taxonInfo.scientificName){
            taxon.scientificName = taxonInfo.scientificName
        }
        if(taxonInfo.popularity){
            taxon.popularity = taxonInfo.popularity
        }
    })
    //console.log("all taxa data loaded", allTaxaDictionary)
}

loadAllTaxa()


export {findOrCreateTaxon, allTaxaDictionary}