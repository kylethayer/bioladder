class Taxon{
    constructor(name){
        this.name = name
        this.isFullyLoaded = false;
    }

    async load(){
        //TODO: fetch file for this taxon
        let taxon_file_name = this.name.replaceAll(" ", "_") + ".json"
        const taxonDataResponse = await fetch(settings.data_url_base + "taxa/" + taxon_file_name)
        const taxonData = await taxonDataResponse.json();
    }
}

export default Taxon