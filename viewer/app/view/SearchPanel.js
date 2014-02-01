/**
 *  Copyright (C) 2014 BioLadder.Org
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

Ext.define('BioLadderOrg.view.SearchPanel', {
    xtype: 'searchPanel',
    extend: 'Ext.Panel',

    requires: [
        'Ext.field.Text',
        'Ext.dataview.List'
    ],
    
    config: {
        control: {
            '#searchCloseBtn': {
                tap: function () {this.hide(); }
            },
            '#searchField': {
                keyup: 'onSearchFieldChange'
            },
            '#resultsList': {
                itemtap: 'onResultListSelect'
            }
        },
        border: 1,
        centered: true,
        hideOnMaskTap: true,
        items: [{
            xtype: 'titlebar',
            docked: 'top',
            title: 'Search',
            items: [{
                xtype: 'button',
                html: 'close',
                itemId: 'searchCloseBtn'
            }]
        }, {
            xtype: 'textfield',
            itemId: 'searchField',
            docked: 'top',
            name: 'searchString',
            placeHolder: 'Type your search here.'
        }, {
            xtype: 'list',
            itemId: 'resultsList',
            disableSelection: true,
            itemTpl: '{name}',
            height: '100%'
        }],
        maxHeight: 500,
        maxWidth: 400,
        modal: true,
        height: "90%",
        width: "90%"
    },

    initialize: function () {
        this.on('hide', function () {this.destroy(); });
        
        this.searches = [
            {
                name: 'opensearch',
                before: '../wiki/api.php?format=json&action=opensearch&search=',
                after: '&namespace=0&suggest='
            },
            {
                name: 'srsearch',
                before: '../wiki/api.php?action=query&list=search&srsearch=',
                after: '&srprop=&format=json'
            }
        ];
        
        this.__searchResults = {};
    },
    
    onSearchFieldChange: function(field) {
        var ME = this;
        searchString = field.getValue();
        if(searchString && searchString != '' && this.__currentSearch == searchString){
            return;
        }
        
        ME.__currentSearch = searchString;

        if(ME.down('#resultsList').getStore()){
            ME.down('#resultsList').getStore().removeAll();
        }
        
        ME.displaySearchResults(searchString);
        ME.loadNextSearch(searchString);
    },
    
    loadNextSearch: function(searchString){
        var ME = this;

        if(ME.__currentSearch != searchString){
            return;
        }

        if(!(searchString in ME.__searchResults)){
            ME.__searchResults[searchString] = {};
        }

        var searchResults = ME.__searchResults[searchString];

        var searchToDo = null;
        for(var i = 0; i < ME.searches.length; i++){
            if(!(ME.searches[i].name in searchResults)){
                searchToDo = ME.searches[i];
                searchResults[searchToDo] = 'Searching';
                break;
            }
        }

        if(searchToDo){
            Ext.Ajax.request({
                disableCaching: false,
                url: searchToDo.before+searchString+searchToDo.after,
                success: function (response) {
                    var decodedResponse = Ext.JSON.decode(response.responseText);
                    if(decodedResponse.query){
                        var decodedResults = decodedResponse.query.search;
                        searchResults[searchToDo.name] = [];
                        for(var i=0; i < decodedResults.length; i++){
                            searchResults[searchToDo.name].push(decodedResults[i].title);
                        }
                    }else{
                        searchResults[searchToDo.name] = decodedResponse[1];
                    }
                    
                    ME.displaySearchResults(searchString);
                    ME.loadNextSearch(searchString);
                }
            });
        }
    },
    
    displaySearchResults: function(searchString){
        var ME = this;

        if(ME.__currentSearch != searchString){
            return;
        }

        var searchResults = ME.__searchResults[searchString];
        var searchResultList = [];
        var areAnyIncompleteSearches = false;
        if(searchResults){
            //loop through searches building a list
            for(var i=0; i < ME.searches.length; i++){
                if(searchResults[ME.searches[i].name] && searchResults[ME.searches[i].name] != "Searching"){
                    list = searchResults[ME.searches[i].name];
                    if(searchResultList.length == 0){
                        searchResultList = list.slice(0);
                    }else{
                        //add any results that aren't already there
                        for(var j = 0; j < list.length; j++){
                            if(searchResultList.indexOf(list[j]) == -1){
                                searchResultList.push(list[j]);
                            }
                        }
                    }
                }else{
                    areAnyIncompleteSearches = true;
                }
            }
        }else{
            areAnyIncompleteSearches = true;
        }
        
        //if a search not complete add "loading..." to the end
        if(areAnyIncompleteSearches){
          searchResultList.push("Loading...");
        }

        var convertedResults = [];
        for(var i = 0; i < searchResultList.length; i++){
            if(searchResultList[i] != 'Main Page'){ //Main page should be the only non-taxon in the main wiki space
                convertedResults.push({name: searchResultList[i]});
            }
        }
        if(ME.down('#resultsList').getStore()){
            ME.down('#resultsList').getStore().removeAll();
        }
        if(convertedResults.length > 0){
            ME.down('#resultsList').setData(convertedResults);
        }
    },
    
    onResultListSelect: function(list, index, target, record){
        if(record.get('name') == "Loading..."){
            return;
        }
        this.fireEvent('navigatetotaxon', record.get('name'));
        this.hide();
    }

});
