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
            {
                name: 'simplifiedAncestor',
                type: 'auto',
                convert: function (simplifiedAncestor, record) {
                    if (simplifiedAncestor && typeof simplifiedAncestor === 'string') {
                        //make sure the name is a legitimate name
                        if (!/^[-_\w\s]+$/.test(simplifiedAncestor)) {
                            window.console.error('Simplified Ancestor name must be normal characters:', ancestor);
                            return Ext.getStore('Taxa').findOrCreateTaxon('Could not parse name');
                        }
                        //convert it into an simplifiedAncestor object
                        return Ext.getStore('Taxa').findOrCreateTaxon(simplifiedAncestor);
                    }
                    return simplifiedAncestor;
                }
            }, {
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
            {name: 'simplifiedDescendants', type: 'auto'},
            {  
                name: 'popularDescendants',
                type: 'auto',
                convert: function (popularDescendants, record) {
                    if(popularDescendants != null && popularDescendants.length > 0){
                        for(var i = 0; i < popularDescendants.length; i++){
                            if (popularDescendants[i] && typeof popularDescendants[i] === 'string') {
                                //make sure the name is a legitimate name
                                if (!/^[\w\s]+$/.test(popularDescendants[i])) {
                                    window.console.error('Popular Descendant name must be normal characters:', popularDescendants[i]);
                                    popularDescendants[i] = Ext.getStore('Taxa').findOrCreateTaxon('Could not parse name');
                                }
                                //convert it into an simplifiedAncestor object
                                popularDescendants[i] = Ext.getStore('Taxa').findOrCreateTaxon(popularDescendants[i]);
                            }
                        }
                    }
                    return popularDescendants;
                }
            },
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
            {name: 'areSimplifiedDescendantsLoaded',  type: 'bool', defaultValue: false},
            {name: 'areSimplifiedDescendantsLoading',  type: 'bool', defaultValue: false},
            {name: 'simplifiedDescendantsLoadedCallbacks',  type: 'auto', defaultValue: []}
        ],
        isLoaded: false,
        isLoading: false,
        loadedCallbacks: [],
        areSimplifiedDescendantsLoaded: false,
        areSimplifiedDescendantsLoading: false,
        simplifiedDescendantsLoadedCallbacks: []
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
        if (!me.get('areSimplifiedDescendantsLoaded') && !me.get('areSimplifiedDescendantsLoading')) {
            me.set('areSimplifiedDescendantsLoading', true);
            searchObj = Ext.create('BioLadderOrg.model.TaxonSearch');
            searchObj.runSearch({
                conditions: {'Has Simplified Ancestor': me.get('name')},
                success: function (taxa) {
                    me.set('simplifiedDescendants', taxa);
                    me.set('areSimplifiedDescendantsLoading', false);
                    me.set('areSimplifiedDescendantsLoaded', true);
                    for (index in me.get('simplifiedDescendantsLoadedCallbacks')) {
                        me.get('simplifiedDescendantsLoadedCallbacks')[index](me);
                    }
                    me.set('simplifiedDescendantsLoadedCallbacks', []);
                },
                failure: function (){
                    Ext.Msg.alert("Load Failed", "Failed to load descendants of an organism, you may need to refresh the page");
                }
            });
        }
    },

    whenSimplifiedDescendantsLoaded: function (callback) {
        var me = this;
        if (me.get('areSimplifiedDescendantsLoaded')) {
            callback(me);
            return;
        }
        //make sure a new array is created so we don't mess with the default array
        me.set('simplifiedDescendantsLoadedCallbacks', [callback].concat(me.get('simplifiedDescendantsLoadedCallbacks')));
        me.ensureFullyLoaded();
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
        requestFields =  ['Has Simplified Ancestor', 'Has Wikipedia Image', 'Has Wikipedia Page', 'Has Popular Descendants'];
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
                        if (printouts['Has Simplified Ancestor'] && printouts['Has Simplified Ancestor'].length > 0) {
                            taxonFields.simplifiedAncestor = printouts['Has Simplified Ancestor'][0].fulltext;
                        }
                        if (printouts['Has Wikipedia Image'] && printouts['Has Wikipedia Image'].length > 0) {
                            taxonFields.wikipediaImage = printouts['Has Wikipedia Image'][0];
                        }
                        if (printouts['Has Wikipedia Page'] && printouts['Has Wikipedia Page'].length > 0) {
                            taxonFields.wikipediaPage = printouts['Has Wikipedia Page'][0];
                        }
                        if (printouts['Has Popular Descendants'] && printouts['Has Popular Descendants'].length > 0) {
                            popularDescendants = [];
                            for(var i = 0; i < printouts['Has Popular Descendants'].length; i++){
                              popularDescendants[i] = printouts['Has Popular Descendants'][i].fulltext;
                            }
                            taxonFields.popularDescendants = popularDescendants;
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