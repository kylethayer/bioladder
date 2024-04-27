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
        this.isFullyLoaded = false;
    }



    async load(){
        let taxon_file_name = this.name.replaceAll(" ", "_") + ".json"
        const taxonDataResponse = await fetch(settings.data_url_base + "taxa/" + taxon_file_name)
        const taxonData = await taxonDataResponse.json();

        this.description = taxonData.description;
        this.exampleMember = findOrCreateTaxon(taxonData.exampleMember)

    }
}

export default Taxon


//*******************
// OLD CODE TO COPY STUFF FROM

// { 
//     name: 'description', 
//     type: 'string'
// },
// {
//     name: 'exampleMember',
//     type: 'auto',
//     convert: function (exampleMember, record) {
//         if (exampleMember && typeof exampleMember === 'string') {
//             exampleMember = BioLadderOrg.model.Taxon.cleanTaxonName(exampleMember);
//             //make sure the name is a legitimate name
//             if (!BioLadderOrg.model.Taxon.isTaxonNameValid(exampleMember)) {
//                 window.console.error('Example Member name must be normal characters:', ancestor);
//                 return Ext.getStore('Taxa').findOrCreateTaxon('Could not parse name');
//             }
//             //convert it into an exampleMember object
//             return Ext.getStore('Taxa').findOrCreateTaxon(exampleMember);
//         }
//         return exampleMember;
//     }
// },
// { name: 'exampleMemberText', type: 'string' },
// {
//     name: 'name',
//     type: 'string',
//     convert: function (name, record) { //make sure the name is a legitimate name
//         name = BioLadderOrg.model.Taxon.cleanTaxonName(name);
//         if (typeof name !== 'string' || !BioLadderOrg.model.Taxon.isTaxonNameValid(name)) {
//             window.console.error('Name must be normal characters:', name);
//             return 'Could not parse name';
//         }
//         return name;
//     }
// }, 
// { 
//     name: 'isExtinct', 
//     type: 'string',
//     convert: function (name, record) { //make sure the name is a legitimate name
//         if(name == "t"){
//             return "Extinct";
//         } else if (name == "f"){
//             return "Living";
//         }else{
//             return null;
//         }
//     }
// },
// { name: 'otherNames', type: 'string' },
// {
//     name: 'parentTaxon',
//     type: 'auto',
//     convert: function (parentTaxon, record) {
//         if (parentTaxon && typeof parentTaxon === 'string') {
//             //make sure the name is a legitimate name
//             parentTaxon = BioLadderOrg.model.Taxon.cleanTaxonName(parentTaxon);
//             if (!BioLadderOrg.model.Taxon.isTaxonNameValid(parentTaxon)) {
//                 window.console.error('Parent Taxon name must be normal characters:', ancestor);
//                 return Ext.getStore('Taxa').findOrCreateTaxon('Could not parse name');
//             }
//             //convert it into an parentTaxon object
//             return Ext.getStore('Taxa').findOrCreateTaxon(parentTaxon);
//         }
//         return parentTaxon;
//     }
// }, {  
//     name: 'popularAncestor1',
//     type: 'auto',
//     convert: function (popAncestor, record) {
//         if (popAncestor && typeof popAncestor === 'string') {
//             //make sure the name is a legitimate name
//             popAncestor = BioLadderOrg.model.Taxon.cleanTaxonName(popAncestor);
//             if (!BioLadderOrg.model.Taxon.isTaxonNameValid(popAncestor)) {
//                 window.console.error('Parent Taxon name must be normal characters:', ancestor);
//                 return Ext.getStore('Taxa').findOrCreateTaxon('Could not parse name');
//             }
//             //convert it into an popAncestor object
//             return Ext.getStore('Taxa').findOrCreateTaxon(popAncestor);
//         }
//         return popAncestor;
//     }
// }, {  
//     name: 'popularAncestor2',
//     type: 'auto',
//     convert: function (popAncestor, record) {
//         if (popAncestor && typeof popAncestor === 'string') {
//             popAncestor = BioLadderOrg.model.Taxon.cleanTaxonName(popAncestor);
//             //make sure the name is a legitimate name
//             if (!BioLadderOrg.model.Taxon.isTaxonNameValid(popAncestor)) {
//                 window.console.error('Parent Taxon name must be normal characters:', ancestor);
//                 return Ext.getStore('Taxa').findOrCreateTaxon('Could not parse name');
//             }
//             //convert it into an popAncestor object
//             return Ext.getStore('Taxa').findOrCreateTaxon(popAncestor);
//         }
//         return popAncestor;
//     }
// }, {  
//     name: 'popularAncestor3',
//     type: 'auto',
//     convert: function (popAncestor, record) {
//         if (popAncestor && typeof popAncestor === 'string') {
//             popAncestor = BioLadderOrg.model.Taxon.cleanTaxonName(popAncestor);
//             //make sure the name is a legitimate name
//             if (!BioLadderOrg.model.Taxon.isTaxonNameValid(popAncestor)) {
//                 window.console.error('Parent Taxon name must be normal characters:', ancestor);
//                 return Ext.getStore('Taxa').findOrCreateTaxon('Could not parse name');
//             }
//             //convert it into an popAncestor object
//             return Ext.getStore('Taxa').findOrCreateTaxon(popAncestor);
//         }
//         return popAncestor;
//     }
// }, {  
//     name: 'popularAncestor4',
//     type: 'auto',
//     convert: function (popAncestor, record) {
//         if (popAncestor && typeof popAncestor === 'string') {
//             popAncestor = BioLadderOrg.model.Taxon.cleanTaxonName(popAncestor);
//             //make sure the name is a legitimate name
//             if (!BioLadderOrg.model.Taxon.isTaxonNameValid(popAncestor)) {
//                 window.console.error('Parent Taxon name must be normal characters:', ancestor);
//                 return Ext.getStore('Taxa').findOrCreateTaxon('Could not parse name');
//             }
//             //convert it into an popAncestor object
//             return Ext.getStore('Taxa').findOrCreateTaxon(popAncestor);
//         }
//         return popAncestor;
//     }
// }, {  
//     name: 'popularSubTaxa',
//     type: 'auto',
//     convert: function (popularSubTaxa, record) {
//         if(popularSubTaxa != null && popularSubTaxa.length > 0){
//             for(var i = 0; i < popularSubTaxa.length; i++){
//                 if (popularSubTaxa[i] && typeof popularSubTaxa[i] === 'string') {
//                     popularSubTaxa[i] = BioLadderOrg.model.Taxon.cleanTaxonName(popularSubTaxa[i]);
//                     //make sure the name is a legitimate name
//                     if (!BioLadderOrg.model.Taxon.isTaxonNameValid(popularSubTaxa[i])) {
//                         window.console.error('Popular Subtaxa name must be normal characters:', popularSubTaxa[i]);
//                         popularSubTaxa[i] = Ext.getStore('Taxa').findOrCreateTaxon('Could not parse name');
//                     }
//                     //convert it into an parentTaxon object
//                     popularSubTaxa[i] = Ext.getStore('Taxa').findOrCreateTaxon(popularSubTaxa[i]);
//                 }
//             }
//         }
//         return popularSubTaxa;
//     }
// },
// { name: 'popularity', type: 'float'},
// { name: 'scientificName', type: 'string' },
// { name: 'subTaxa', type: 'auto' },
// {
//     name: 'wikipediaImage',
//     type: 'string',
//     convert: function (wikipediaImage, record) { //make sure it is a string and a wikimedia url
//         if (wikipediaImage && (typeof wikipediaImage !== 'string' ||
//             !/^https?:\/\/upload\.wikimedia\.org\/[%\w\.\/-]+$/.test(wikipediaImage))) {
//             window.console.error('wikipediaImage must be at http://upload.wikimedia.org/:', wikipediaImage);
//             return null;
//         }
//         return wikipediaImage;
//     }
// },
// {name: 'taxonomicRank', type: 'string'},
// {name: 'wikiPage', type: 'string'},
// {
//     name: 'wikipediaPage',
//     type: 'string',
//     convert: function (wikipediaPage, record) { //make sure it is a string and a wikipedia page
//         if (wikipediaPage && (typeof wikipediaPage !== 'string' ||
//             !/^https?:\/\/en\.wikipedia\.org\/wiki\/[\w\s-_%#]+$/.test(wikipediaPage))) {
//             window.console.error('wikipediaPage must be at http://en.wikipedia.org/:', wikipediaPage);
//             return null;
//         }
//         return wikipediaPage;
//     }
// },
// //processingFields
// {name: 'isLoaded',  type: 'bool', defaultValue: false},
// {name: 'isLoading',  type: 'bool', defaultValue: false},
// {name: 'loadedCallbacks',  type: 'auto', defaultValue: []},
// {name: 'areSubTaxaLoaded',  type: 'bool', defaultValue: false},
// {name: 'areSubTaxaLoading',  type: 'bool', defaultValue: false},
// {name: 'subTaxaLoadedCallbacks',  type: 'auto', defaultValue: []}
// ],
// isLoaded: false,
// isLoading: false,
// loadedCallbacks: [],
// areSubTaxaLoaded: false,
// areSubTaxaLoading: false,
// subTaxaLoadedCallbacks: []