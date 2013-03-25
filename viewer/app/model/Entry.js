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

Ext.define('BioLadderOrg.model.Entry', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'ancestor',
                type: 'auto',
                convert: function (ancestor, record) { //if string, create unloaded Entry object
                    if (typeof ancestor === 'string') {
                        return Ext.getStore('Entries').findOrCreateEntry(ancestor);
                    }
                    return ancestor;
                }
            },
            {name: 'name',   type: 'string'},
            {name: 'descendants',  type: 'auto'},
            {name: 'wikipediaImage', type: 'string'},
            //processingFields
            {name: 'isLoaded',  type: 'bool', defaultValue: false},
            {name: 'isLoading',  type: 'bool', defaultValue: false},
            {name: 'loadedCallbacks',  type: 'auto', defaultValue: []},
            {name: 'areDescendantsLoaded',  type: 'bool', defaultValue: false},
            {name: 'areDescendantsLoading',  type: 'bool', defaultValue: false},
            {name: 'descendantsLoadedCallbacks',  type: 'auto', defaultValue: []}
        ],
        isLoaded: false,
        isLoading: false,
        loadedCallbacks: [],
        areDescendantsLoaded: false,
        areDescendantsLoading: false,
        descendantsLoadedCallbacks: []
    },

    ensureFullyLoaded: function () {
        var searchObj, index, me = this;
        if (!me.get('isLoaded') && !me.get('isLoading')) {
            me.set('isLoading', true);
            searchObj = Ext.create('BioLadderOrg.model.EntrySearch');
            searchObj.runSearch({
                name: me.get('name'),
                success: function (entries) {
                    //This should be already done: me.set('isLoaded', true);
                    me.set('isLoading', false);
                    for (index in me.get('loadedCallbacks')) {
                        me.get('loadedCallbacks')[index](me);
                    }
                    me.set('loadedCallbacks', []);
                }
            });
        }
        if (!me.get('areDescendantsLoaded') && !me.get('areDescendantsLoading')) {
            me.set('areDescendantsLoading', true);
            searchObj = Ext.create('BioLadderOrg.model.EntrySearch');
            searchObj.runSearch({
                conditions: {'Has Ancestor': me.get('name')},
                success: function (entries) {
                    me.set('descendants', entries);
                    me.set('areDescendantsLoading', false);
                    me.set('areDescendantsLoaded', true);
                    for (index in me.get('descendantsLoadedCallbacks')) {
                        me.get('descendantsLoadedCallbacks')[index](me);
                    }
                    me.set('descendantsLoadedCallbacks', []);
                }
            });
        }
    },

    whenDescendantsLoaded: function (callback) {
        var me = this;
        if (me.get('areDescendantsLoaded')) {
            callback(me);
            return;
        }
        //make sure a new array is created so we don't mess with the default array
        me.set('descendantsLoadedCallbacks', [callback].concat(me.get('descendantsLoadedCallbacks')));
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

Ext.define('BioLadderOrg.model.EntrySearch', {
    runSearch: function (args) {
        var requestFields, i, property,
            url = window.location.pathname.slice(0, window.location.pathname.search('/\/viewer/') - 7) + '/wiki/api.php?action=ask';

        //build
        url += '&query=';
        if (args.name) {
            url += '[[' + args.name + ']]'; //NOTE: for multiple names [[Entry1||Entry2]]
        }
        if (args.conditions) {
            for (property in args.conditions) {
                url += '[[' + property + '::' + args.conditions[property] + ']]';
            }
        }
        requestFields =  ['Has Ancestor', 'Has Wikipedia Image'];
        for (i = 0; i < requestFields.length; i++) {
            url += '|?' + requestFields[i];
        }

        url += '&format=json';

        Ext.Ajax.request({
            url: url,
            success: function (response) {
                var results, entries, entriesStore, entryName, entryFields, printouts, fieldName, entry,
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
                        this.fireEvent('exception', this, response, 'Unable to parse the JSON returned by the server: ' + ex.toString());
                        Ext.Logger.warn('Unable to parse the JSON returned by the server: ' + ex.toString());
                    }
                }
                results = data.query.results;
                entries = [];
                entriesStore = Ext.getStore('Entries');
                for (entryName in results) {
                    entryFields = {
                        'name': results[entryName].fulltext
                    };
                    printouts = results[entryName].printouts;
                    if (printouts) {
                        if (printouts['Has Ancestor'] && printouts['Has Ancestor'].length > 0) {
                            entryFields.ancestor = printouts['Has Ancestor'][0].fulltext;
                        }
                        if (printouts['Has Wikipedia Image'] && printouts['Has Wikipedia Image'].length > 0) {
                            entryFields.wikipediaImage = printouts['Has Wikipedia Image'][0];
                        }
                    }
                    //check if Entry already exists, if so add details to it, if not, create it and add to store
                    entry = Ext.getStore('Entries').findOrCreateEntry(entryFields.name);
                    for (fieldName in entryFields) {
                        entry.set(fieldName, entryFields[fieldName]);
                    }
                    entry.set('isLoaded', true);
                    entries.push(entry);
                }
                args.success(entries);
            }
        });
    }
});