import settings from "../settings.js"
import findOrCreateTaxon from './allTaxa.js'

function isTaxonNameValid(taxonName){
    return /^[-_\w\s'ñ]+$/.test(taxonName)
}

class Taxon{
    constructor(name){
        if(!isTaxonNameValid(name)){
            throw Error("Invalid Taxon name")
        }
        this.name = name
        this.isLoaded = false;
    }



    async ensureLoaded(){
        let taxon_file_name = this.name.replaceAll(" ", "_") + ".json"
        const taxonDataResponse = await fetch(settings.data_url_base + "taxa/" + taxon_file_name)
        const taxonData = await taxonDataResponse.json();

        if(taxonData.description !== undefined){
            this.description = taxonData.description
        }
        if(taxonData.example_member !== undefined && taxonData.example_member !== ""){
            this.example_member = findOrCreateTaxon(taxonData.example_member)
        }
        if(taxonData.example_member_type !== undefined){
            this.example_member_type = taxonData.example_member_type
        }
        if(taxonData.extinct !== undefined){
            this.extinct = taxonData.extinct
        }
        if(taxonData.other_names !== undefined){
            this.other_names = taxonData.other_names
        }
        if(taxonData.parent_taxon !== undefined && taxonData.parent_taxon !== ""){
            this.parent_taxon = findOrCreateTaxon(taxonData.parent_taxon)
        }
        if(taxonData.popular_ancestors !== undefined){
            this.popular_ancestors = taxonData.popular_ancestors.map(popAncTaxonName => findOrCreateTaxon(popAncTaxonName))
        }
        if(taxonData.popular_subtaxa !== undefined){
            this.popular_subtaxa = taxonData.popular_subtaxa.map(popSubTaxonName => findOrCreateTaxon(popSubTaxonName))
        }
        if(taxonData.popularity !== undefined){
            this.popularity = taxonData.popularity
        }
        if(taxonData.scientific_name !== undefined){
            this.scientific_name = taxonData.scientific_name
        }
        //TODO: add subtaxa to dataset source
       //TODO  wikipedia_img
//     convert: function (wikipediaImage, record) { //make sure it is a string and a wikimedia url
//         if (wikipediaImage && (typeof wikipediaImage !== 'string' ||
//             !/^https?:\/\/upload\.wikimedia\.org\/[%\w\.\/-]+$/.test(wikipediaImage))) {
//             window.console.error('wikipediaImage must be at http://upload.wikimedia.org/:', wikipediaImage);
//             return null;
//         }
//         return wikipediaImage;
//     }
        
        if(taxonData.taxonomic_rank !== undefined){
            this.taxonomic_rank = taxonData.taxonomic_rank
        }
        
        // TODO wikipedia_page
//     convert: function (wikipediaPage, record) { //make sure it is a string and a wikipedia page
//         if (wikipediaPage && (typeof wikipediaPage !== 'string' ||
//             !/^https?:\/\/en\.wikipedia\.org\/wiki\/[\w\s-_%#]+$/.test(wikipediaPage))) {
//             window.console.error('wikipediaPage must be at http://en.wikipedia.org/:', wikipediaPage);
//             return null;
//         }
//         return wikipediaPage;
//     }

        this.isLoaded = true;
        console.log("loaded taxon", this) 
    }
}

export default Taxon