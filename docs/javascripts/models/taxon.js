import settings from "../settings.js"
import findOrCreateTaxon from './allTaxa.js'

function isTaxonNameValid(taxonName){
    return /^[-_\w\s'ñ]+$/.test(taxonName)
}

class Taxon extends EventTarget{
    constructor(name){
        super();
        if(!isTaxonNameValid(name)){
            throw Error("Invalid Taxon name")
        }
        this.name = name
        this.loadInfo = {
            isLoaded: false,
            isLoading: false,
            loadedEvent: new CustomEvent("loaded"),
            areRelatedLoaded: false,
            areRelatedLoading: false,
            areRelatedRelatedLoaded: false,
            areRelatedRelatedLoading: false
        }
        
    }

    // Loads this taxon info
    async ensureLoaded(){
        // How do I await if it is loading but not loaded?
        if(!this.loadInfo.isLoaded && !this.loadInfo.isLoading){
            this.loadInfo.isLoading = true;
            let taxon_file_name = this.name.replaceAll(" ", "_") + ".json"

            const taxonDataResponse = await fetch(settings.data_url_base + "taxa/" + taxon_file_name)
            const taxonData = await taxonDataResponse.json();

            if(taxonData.description !== undefined){
                this.description = taxonData.description
            }
            if(taxonData.example_member !== undefined && taxonData.example_member !== ""){
                this.exampleMember = findOrCreateTaxon(taxonData.example_member)
            }
            if(taxonData.example_member_type !== undefined){
                this.exampleMemberType = taxonData.example_member_type
            }
            if(taxonData.extinct !== undefined){
                this.isExtinct = taxonData.extinct
            }
            if(taxonData.other_names !== undefined){
                this.otherNames = taxonData.other_names
            }
            if(taxonData.parent_taxon !== undefined && taxonData.parent_taxon !== ""){
                this.parentTaxon = findOrCreateTaxon(taxonData.parent_taxon)
            }

            if(taxonData.popular_ancestors !== undefined){
                this.popularAncestors = taxonData.popular_ancestors.map(popAncTaxonName => {
                    if(popAncTaxonName == null){
                        return undefined
                    } else {
                        findOrCreateTaxon(popAncTaxonName)
                    }
                })
            }else{
                this.popularAncestors = []
            }

            if(taxonData.popular_subtaxa !== undefined){
                this.popularSubtaxa = taxonData.popular_subtaxa.map(popSubTaxonName => findOrCreateTaxon(popSubTaxonName))
            }else{
                this.popularSubtaxa = []
            }

            if(taxonData.popularity !== undefined){
                this.popularity = taxonData.popularity
            }
            if(taxonData.scientific_name !== undefined){
                this.scientificName = taxonData.scientific_name
            }
            //TODO: add subtaxa to dataset source
            this.subtaxa = []

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
                this.taxonomicRank = taxonData.taxonomic_rank
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
            console.log("loaded taxon", this) 

            this.loadInfo.isLoaded = true;
            this.dispatchEvent(this.loadInfo.loadedEvent)
            

        } else if(!this.loadInfo.isLoaded && this.loadInfo.isLoading){
            console.log("ensureloaded trying to await load of " + this.name) 
            // if currently loading, wait until loaded event is fired
            await new Promise((resolve, reject) => this.addEventListener("loaded", resolve))
            console.log("ensureloaded continuing after await load of " + this.name)
        }
    }

    // Loads info on taxa that will appear onscreen if this taxon is in view
    async ensureRelatedLoaded(){
        if(!this.loadInfo.areRelatedLoaded && !this.loadInfo.areRelatedLoading){
            this.loadInfo.areRelatedLoading = true;
            
            await this.ensureLoaded();
            if(this.parentTaxon !== undefined){
                this.parentTaxon.ensureLoaded();
            }
            if(this.exampleMember !== undefined){
                this.exampleMember.ensureLoaded();
            }

            this.subtaxa.forEach(async subtaxon => {
                await subtaxon.ensureLoaded()
                subtaxon.popularAncestors.forEach((subtaxonPopAnc) => 
                    subtaxonPopAnc != null ? subtaxonPopAnc.ensureLoaded() : null
                )
            })

            this.popularAncestors.forEach((popAncestor) => 
                popAncestor != null ? popAncestor.ensureLoaded() : null
            )

            this.popularSubtaxa.forEach((popSubtaxon) => 
                popSubtaxon.ensureLoaded()
            )

            this.loadInfo.areRelatedLoaded = true
        }
    }

    // Loads info on taxa that will appear onscreen if this taxon is in view and one of the
    // visible taxa are clicked on
    async ensureRelatedRelatedLoaded(){
        if(!this.loadInfo.areRelatedRelatedLoaded && !this.loadInfo.areRelatedRelatedLoading){
            this.loadInfo.areRelatedRelatedLoading = true;
            
            await this.ensureLoaded();
            if(this.parentTaxon !== undefined){
                this.parentTaxon.ensureRelatedLoaded();
            }
            if(this.exampleMember !== undefined){
                this.exampleMember.ensureRelatedLoaded();
            }

            this.subtaxa.forEach(async subtaxon => {
                await subtaxon.ensureLoaded()
                subtaxon.popularAncestors.forEach((subtaxonPopAnc) => 
                    subtaxonPopAnc != null ? subtaxonPopAnc.ensureRelatedLoaded() : null
                )
            })

            this.popularAncestors.forEach((popAncestor) => 
                popAncestor != null ? popAncestor.ensureRelatedLoaded() : null
            )

            this.popularSubtaxa.forEach((popSubtaxon) => 
                popSubtaxon.ensureRelatedLoaded()
            )   

            this.loadInfo.areRelatedRelatedLoaded = true
        }
    }
}

export default Taxon