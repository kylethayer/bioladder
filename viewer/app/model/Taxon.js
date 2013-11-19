/**
 *  Copyright (C) 2013 BioLadder.Org
 *
 *  This file is part of the BioLadder.Org project (http://bioladder.org/)
 *
 *  BioLadder.Org is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('BioLadderOrg.model.Taxon', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            { name: 'description', type: 'string' },
            {
                name: 'exampleMember',
                type: 'auto',
                convert: function (exampleMember, record) {
                    if (exampleMember && typeof exampleMember === 'string') {
                        //make sure the name is a legitimate name
                        if (!/^[-_\w\s]+$/.test(exampleMember)) {
                            window.console.error('Example Member name must be normal characters:', ancestor);
                            return Ext.getStore('Taxa').findOrCreateTaxon('Could not parse name');
                        }
                        //convert it into an exampleMember object
                        return Ext.getStore('Taxa').findOrCreateTaxon(exampleMember);
                    }
                    return exampleMember;
                }
            },
            { name: 'exampleMemberText', type: 'string' },
            {
                name: 'name',
                type: 'string',
                convert: function (name, record) { //make sure the name is a legitimate name
                    if (typeof name !== 'string' || !/^[-_\w\s]+$/.test(name)) {
                        window.console.error('Name must be normal characters:', name);
                        return 'Could not parse name';
                    }
                    return name;
                }
            }, 
            { name: 'otherNames', type: 'string' },
            {
                name: 'parentTaxon',
                type: 'auto',
                convert: function (parentTaxon, record) {
                    if (parentTaxon && typeof parentTaxon === 'string') {
                        //make sure the name is a legitimate name
                        if (!/^[-_\w\s]+$/.test(parentTaxon)) {
                            window.console.error('Parent Taxon name must be normal characters:', ancestor);
                            return Ext.getStore('Taxa').findOrCreateTaxon('Could not parse name');
                        }
                        //convert it into an parentTaxon object
                        return Ext.getStore('Taxa').findOrCreateTaxon(parentTaxon);
                    }
                    return parentTaxon;
                }
            }, {  
                name: 'popularSubTaxa',
                type: 'auto',
                convert: function (popularSubTaxa, record) {
                    if(popularSubTaxa != null && popularSubTaxa.length > 0){
                        for(var i = 0; i < popularSubTaxa.length; i++){
                            if (popularSubTaxa[i] && typeof popularSubTaxa[i] === 'string') {
                                //make sure the name is a legitimate name
                                if (!/^[\w\s]+$/.test(popularSubTaxa[i])) {
                                    window.console.error('Popular Subtaxa name must be normal characters:', popularSubTaxa[i]);
                                    popularSubTaxa[i] = Ext.getStore('Taxa').findOrCreateTaxon('Could not parse name');
                                }
                                //convert it into an parentTaxon object
                                popularSubTaxa[i] = Ext.getStore('Taxa').findOrCreateTaxon(popularSubTaxa[i]);
                            }
                        }
                    }
                    return popularSubTaxa;
                }
            },
            { name: 'scientificName', type: 'string' },
            { name: 'subTaxa', type: 'auto' },
            {
                name: 'wikipediaImage',
                type: 'string',
                convert: function (wikipediaImage, record) { //make sure it is a string and a wikimedia url
                    if (wikipediaImage && (typeof wikipediaImage !== 'string' ||
                        !/^https?:\/\/upload\.wikimedia\.org\/[%\w\.\/-]+$/.test(wikipediaImage))) {
                        window.console.error('wikipediaImage must be at http://upload.wikimedia.org/:', wikipediaImage);
                        return null;
                    }
                    return wikipediaImage;
                }
            },
            {name: 'taxonomicRank', type: 'string'},
            {name: 'wikiPage', type: 'string'},
            {
                name: 'wikipediaPage',
                type: 'string',
                convert: function (wikipediaPage, record) { //make sure it is a string and a wikipedia page
                    if (wikipediaPage && (typeof wikipediaPage !== 'string' ||
                        !/^https?:\/\/en\.wikipedia\.org\/wiki\/[\w\s-_%]+$/.test(wikipediaPage))) {
                        window.console.error('wikipediaPage must be at http://en.wikipedia.org/:', wikipediaPage);
                        return null;
                    }
                    return wikipediaPage;
                }
            },
            //processingFields
            {name: 'isLoaded',  type: 'bool', defaultValue: false},
            {name: 'isLoading',  type: 'bool', defaultValue: false},
            {name: 'loadedCallbacks',  type: 'auto', defaultValue: []},
            {name: 'areSubTaxaLoaded',  type: 'bool', defaultValue: false},
            {name: 'areSubTaxaLoading',  type: 'bool', defaultValue: false},
            {name: 'subTaxaLoadedCallbacks',  type: 'auto', defaultValue: []}
        ],
        isLoaded: false,
        isLoading: false,
        loadedCallbacks: [],
        areSubTaxaLoaded: false,
        areSubTaxaLoading: false,
        subTaxaLoadedCallbacks: []
    },

    ensureFullyLoaded: function () {
        var searchObj, index, me = this;
        if (!me.get('isLoaded') && !me.get('isLoading')) {
            me.set('isLoading', true);
            searchObj = Ext.create('BioLadderOrg.model.TaxonSearch');
            searchObj.runSearch({
                name: me.get('name'),
                success: function (taxa) {
                    //This should be already done: me.set('isLoaded', true);
                    me.set('isLoading', false);
                    for (index in me.get('loadedCallbacks')) {
                        me.get('loadedCallbacks')[index](me);
                    }
                    me.set('loadedCallbacks', []);
                },
                failure: function (record){
                    Ext.Msg.alert("Load Failed", "Failed to load an organism Taxon, you may need to refresh the page");
                }
            });
        }
        if (!me.get('areSubTaxaLoaded') && !me.get('areSubTaxaLoading')) {
            me.set('areSubTaxaLoading', true);
            searchObj = Ext.create('BioLadderOrg.model.TaxonSearch');
            searchObj.runSearch({
                conditions: {'Has Parent Taxon': me.get('name')},
                success: function (taxa) {
                    me.set('subTaxa', taxa);
                    me.set('areSubTaxaLoading', false);
                    me.set('areSubTaxaLoaded', true);
                    for (index in me.get('subTaxaLoadedCallbacks')) {
                        me.get('subTaxaLoadedCallbacks')[index](me);
                    }
                    me.set('subTaxaLoadedCallbacks', []);
                },
                failure: function (){
                    Ext.Msg.alert("Load Failed", "Failed to load descendants of an organism, you may need to refresh the page");
                }
            });
        }
    },

    whenLoaded: function (callback) {
        var me = this;
        if (me.get('isLoaded')) {
            callback(me);
            return;
        }
        //make sure a new array is created so we don't mess with the default array
        me.set('loadedCallbacks', [callback].concat(me.get('loadedCallbacks')));
        me.ensureFullyLoaded();
    },

    whenSubTaxaLoaded: function (callback) {
        var me = this;
        if (me.get('areSubTaxaLoaded')) {
            callback(me);
            return;
        }
        //make sure a new array is created so we don't mess with the default array
        me.set('subTaxaLoadedCallbacks', [callback].concat(me.get('subTaxaLoadedCallbacks')));
        me.ensureFullyLoaded();
    }
});

Ext.define('BioLadderOrg.model.TaxonSearch', {
    runSearch: function (args) {
        var me =  this, requestFields, i, property,
            url = window.location.pathname.slice(0, window.location.pathname.search('/\/viewer/') - 7) + '/wiki/api.php?action=ask';

        //build
        url += '&query=';
        if (args.name) {
            url += '[[' + args.name + ']]'; //NOTE: for multiple names [[Taxon1||Taxon2]]
        }
        if (args.conditions) {
            for (property in args.conditions) {
                url += '[[' + property + '::' + args.conditions[property] + ']]';
            }
        }
        requestFields =  ['Has Parent Taxon', 'Has Popular Subtaxa', 'Has Example Member', 'Has Example Member Text',
            'Has Taxonomic Rank', 'Has Scientific Name', 'Has Other Names', 'Has Description', 'Has Taxon Wikipedia Image', 'Has Wikipedia Page' ];
        for (i = 0; i < requestFields.length; i++) {
            url += '|?' + requestFields[i];
        }

        url += '&format=json';

        Ext.Ajax.request({
            url: url,
            success: function (response) {
                var results, taxa, taxaStore, taxonName, taxonFields, printouts, fieldName, taxon,
                    data = response.responseText;
                if (typeof data === 'string') {
                    try {
                        data = Ext.decode(data);
                    } catch (ex) {
                        /**
                         * @event exception Fires whenever the reader is unable to parse a response.
                         * @param {Ext.data.reader.Xml} reader A reference to this reader.
                         * @param {XMLHttpRequest} response The XMLHttpRequest response object.
                         * @param {String} error The error message.
                         */
                         //TODO this doesn't work because me doesn't have fireEvent, probably since it is a static function in its class
                        me.fireEvent('exception', me, response, 'Unable to parse the JSON returned by the server: ' + ex.toString());
                        Ext.Logger.warn('Unable to parse the JSON returned by the server: ' + ex.toString());
                    }
                }
                if(data.query === undefined){
                    Ext.Msg.alert("Load Failed", "Failed to load an organism taxon, you may need to refresh the page");
                    return;
                }
                results = data.query.results;
                taxa = [];
                taxaStore = Ext.getStore('Taxa');
                for (taxonName in results) {
                    taxonFields = {
                        'name': results[taxonName].fulltext,
                        'wikiPage': results[taxonName].fullurl
                    };
                    if (typeof taxonFields.name !== 'string' || !/^[-_\w\s]+$/.test(taxonFields.name)) {
                        window.console.error('Name must be normal characters:', taxonFields.name);
                        taxonFields.name = 'Could not parse name';
                    }
                    printouts = results[taxonName].printouts;
                    if (printouts) {
                        //relations
                        if (printouts['Has Parent Taxon'] && printouts['Has Parent Taxon'].length > 0) {
                            taxonFields.parentTaxon = printouts['Has Parent Taxon'][0].fulltext;
                        }
                        if (printouts['Has Example Member'] && printouts['Has Example Member'].length > 0) {
                            taxonFields.exampleMember = printouts['Has Example Member'][0].fulltext;
                        }
                        if (printouts['Has Example Member Text'] && printouts['Has Example Member Text'].length > 0) {
                            taxonFields.exampleMemberText = printouts['Has Example Member Text'][0];
                        }
                        if (printouts['Has Popular Subtaxa'] && printouts['Has Popular Subtaxa'].length > 0) {
                            popularSubTaxa = [];
                            for(var i = 0; i < printouts['Has Popular Subtaxa'].length; i++){
                              popularSubTaxa[i] = printouts['Has Popular Subtaxa'][i].fulltext;
                            }
                            taxonFields.popularSubTaxa = popularSubTaxa;
                        }
                        //information
                        if (printouts['Has Taxonomic Rank'] && printouts['Has Taxonomic Rank'].length > 0) {
                            taxonFields.taxonomicRank = printouts['Has Taxonomic Rank'][0];
                        }
                        if (printouts['Has Taxon Wikipedia Image'] && printouts['Has Taxon Wikipedia Image'].length > 0) {
                            taxonFields.wikipediaImage = printouts['Has Taxon Wikipedia Image'][0];
                        }
                        if (printouts['Has Scientific Name'] && printouts['Has Scientific Name'].length > 0) {
                            taxonFields.scientificName = printouts['Has Scientific Name'][0];
                        }
                        if (printouts['Has Other Names'] && printouts['Has Other Names'].length > 0) {
                            taxonFields.otherNames = printouts['Has Other Names'][0];
                        }
                        if (printouts['Has Description'] && printouts['Has Description'].length > 0) {
                            taxonFields.description = printouts['Has Description'][0];
                        }
                        if (printouts['Has Wikipedia Page'] && printouts['Has Wikipedia Page'].length > 0) {
                            taxonFields.wikipediaPage = printouts['Has Wikipedia Page'][0];
                        }
                        
 
                        
                    }
                    //check if Taxon already exists, if so add details to it, if not, create it and add to store
                    taxon = Ext.getStore('Taxa').findOrCreateTaxon(taxonFields.name);
                    for (fieldName in taxonFields) {
                        taxon.set(fieldName, taxonFields[fieldName]);
                    }
                    taxon.set('isLoaded', true);
                    taxa.push(taxon);
                }
                args.success(taxa);
            }
        });
    }
});