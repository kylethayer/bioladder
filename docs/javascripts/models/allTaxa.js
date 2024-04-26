import settings from "../settings.js"
const allTaxaDictionary = {}


async function loadAllTaxa(){
    console.log("loading all taxa data")
    const allTaxaDataResponse = await fetch(settings.data_url_base + "all_taxon_data.json")
    const tmpAllTaxaDictionary = await allTaxaDataResponse.json();
    Object.entries(tmpAllTaxaDictionary).forEach(
        ([key, value]) => allTaxaDictionary[key] = value
    )
    console.log("all taxa data loaded", allTaxaDictionary)
}

loadAllTaxa()


export default {allTaxaDictionary}