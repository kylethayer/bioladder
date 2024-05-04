import settings from "../settings.js"
import findOrCreateTaxon from './allTaxa.js'

function isTaxonNameValid(taxonName){
    return /^[-_\w\s'ñ]+$/.test(taxonName)
}

class Taxon extends EventTarget{
    constructor(name){
        super();
        if(!isTaxonNameValid(name)){
            throw Error("Invalid Taxon name: " + name)
        }
        this.name = name
        this.loadInfo = {
            isLoaded: false,
            isLoading: false,
            loadedEvent: new CustomEvent("loaded"),
            loadedUpdateFunction: () => {}, // view update function to call when this is loaded
            areRelatedLoaded: false,
            areRelatedLoading: false,
            areRelatedRelatedLoaded: false,
            areRelatedRelatedLoading: false
        }
        
    }

    getPreviewImage(){
        if(this.wikipediaImg){
            return this.wikipediaImg
        }
        if(this.exampleMember){
            return this.exampleMember.wikipediaImg
        }
    }

    // Loads this taxon info
    async ensureLoaded(){
        // How do I await if it is loading but not loaded?
        if(!this.loadInfo.isLoaded && !this.loadInfo.isLoading){
            this.loadInfo.isLoading = true;
            let taxon_file_name = this.name + ".json"

            const taxonDataResponse = await fetch(settings.data_url_base + "taxa_processed/" + taxon_file_name)
            const taxonData = await taxonDataResponse.json();

            if(taxonData.description !== undefined){
                this.description = taxonData.description
            }
            if(taxonData.exampleMember !== undefined && taxonData.exampleMember !== ""){
                this.exampleMember = findOrCreateTaxon(taxonData.exampleMember)
            }
            if(taxonData.exampleMemberType !== undefined){
                this.exampleMemberType = taxonData.exampleMemberType
            }
            if(taxonData.extinct !== undefined){
                this.isExtinct = taxonData.extinct
            }
            if(taxonData.otherNames !== undefined){
                this.otherNames = taxonData.otherNames
            }
            if(taxonData.parentTaxon !== undefined && taxonData.parentTaxon !== ""){
                this.parentTaxon = findOrCreateTaxon(taxonData.parentTaxon)
            }

            if(taxonData.popularAncestors !== undefined){
                this.popularAncestors = taxonData.popularAncestors.map(popAncTaxonName => {
                    if(popAncTaxonName == null){
                        return undefined
                    } else {
                        return findOrCreateTaxon(popAncTaxonName)
                    }
                })
            }else{
                this.popularAncestors = []
            }

            if(taxonData.popularSubtaxa !== undefined){
                this.popularSubtaxa = taxonData.popularSubtaxa.map(popSubTaxonName => findOrCreateTaxon(popSubTaxonName))
            }else{
                this.popularSubtaxa = []
            }

            if(taxonData.popularity !== undefined){
                this.popularity = taxonData.popularity
            }
            if(taxonData.scientificName !== undefined){
                this.scientificName = taxonData.scientificName
            }
            if(taxonData.subtaxa !== undefined){
                this.subtaxa = taxonData.subtaxa.map(subtaxonName => findOrCreateTaxon(subtaxonName))
            }
            if(taxonData.wikipediaImg !== undefined && taxonData.wikipediaImg !== ""){
                if (typeof taxonData.wikipediaImg !== 'string' ||
                    !/^https?:\/\/upload\.wikimedia\.org\/[%\w\.\/-]+$/.test(taxonData.wikipediaImg)) 
                {
                    window.console.error('wikipediaImage must be at http://upload.wikimedia.org/:', taxonData.wikipediaImg);
                } else {
                    this.wikipediaImg = taxonData.wikipediaImg
                }
            }
            if(taxonData.taxonomicRank !== undefined){
                this.taxonomicRank = taxonData.taxonomicRank
            }
            if(taxonData.wikipediaPage !== undefined && taxonData.wikipediaPage !== ""){
                if (typeof taxonData.wikipediaPage !== 'string' ||
                !/^https?:\/\/en\.wikipedia\.org\/wiki\/[\w\s-_%#]+$/.test(taxonData.wikipediaPage)) 
                {
                    window.console.error('wikipediaPage must be at http://en.wikipedia.org/:', taxonData.wikipediaPage);
                } else {
                    this.wikipediaPage = taxonData.wikipediaPage
                }
                
            }
 
            //console.log("loaded taxon", this) 

            // if there is an example subtaxa, then we are only partially loaded
            if(this.exampleMember){
                // go ahead and run updates since we are partially loaded
                this.loadInfo.loadedUpdateFunction()  
                
                // then wait for the example member to be fully loaded before saying we are fully loaded
                await this.exampleMember.ensureLoaded()
            }

            this.loadInfo.isLoaded = true;
            this.dispatchEvent(this.loadInfo.loadedEvent)
            this.loadInfo.loadedUpdateFunction()            

        } else if(!this.loadInfo.isLoaded && this.loadInfo.isLoading){
            // if currently loading, wait until loaded event is fired
            await new Promise((resolve, reject) => this.addEventListener("loaded", resolve))
        }
    }

    async ensurePreviewImageLoaded(){
        
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