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

Ext.define('BioLadderOrg.view.Main', {
    extend: 'Ext.Panel',
    xtype: 'main',
    requires: [
        'Ext.TitleBar',
        'Ext.Label',
        'BioLadderOrg.view.EntryPanel'
    ],
    config: {
        control: {
            'entrypanel': {
                navigatetoentry: function(entryName) {this.fireEvent('navigatetoentry', entryName);}
            },
            '#wikiBtn': {
                tap: function () {window.open(window.location.pathname.slice(0, window.location.pathname.search('/\/viewer/') - 7) + '/wiki','_blank'); }
            },
            '#sourceBtn': {
                tap: function () {window.open('https://code.google.com/p/bioladder/','_blank');}
            }
        },

        entry: null,

        items: [{
            docked: 'top',
            xtype: 'titlebar',
            title: 'BioLadder.org - The Interactive Tree of Life Viewer and Wiki (for Safari and Chrome)',
            items: [{
                xtype: 'button',
                html: 'wiki',
                itemId: 'wikiBtn'
            }, {
                xtype: 'button',
                html: 'source',
                itemId: 'sourceBtn'
            }]
        }, {
            xtype: 'label',
            html: 'Ancestor',
        }, {
            xtype: 'container',
            itemId: 'ancestorContainer',
        }, {
            xtype: 'component',
            height: 20
        }, {
            xtype: 'container',
            itemId: 'entryContainer',
        }, {
            xtype: 'component',
            height: 20
        }, {
            xtype: 'label',
            html: 'Descendants'
        }, {
            xtype: 'label',
            html: 'loading descendants...',
            itemId: 'descendantsListLoadingLabel'
        }, {
            xtype: 'container',
            itemId: 'descendantsContainer',
            layout: 'hbox'
        }],
        
        layout: {
            type: 'vbox',
            align: 'middle'
        }
    },

    initialize: function(){
        this.__EntryPanels = [];
    },

    gotoEntry: function (name) {
        Ext.Viewport.setMasked({
            xtype: 'loadmask'
        });
        var entriesStore, entry, i, 
            foundEntryPanel = false;
            me = this;
        //Search store for it, then load it, setting a callback
        entriesStore = Ext.getStore('Entries');

        entry = Ext.getStore('Entries').findOrCreateEntry(name);

        me.setEntry(entry);

        //me.__EntryPanels = [];
        me.down('#entryContainer').removeAll(false);
        for(i = 0; i < me.__EntryPanels.length; i++){
            if(me.__EntryPanels[i].getEntry() == entry){
                foundEntryPanel = true;
                me.__EntryPanels[i].setCollapsed(false);
                me.down('#entryContainer').add(me.__EntryPanels[i]);
            }
        }

        if(!foundEntryPanel){
            var entrypanel = Ext.widget('entrypanel', {
                entry: entry
            });
            me.__EntryPanels.push(entrypanel);
            entrypanel.setCollapsed(false);
            me.down('#entryContainer').add(entrypanel);
        }

        me.down('#ancestorContainer').removeAll(false);
        entry.whenLoaded(function (loadedEntry) {
            if (loadedEntry === me.getEntry()) {
                Ext.Viewport.setMasked(false);
                var ancestor = loadedEntry.get('ancestor');
                ancestor.ensureFullyLoaded();
                var ancestorEntryPanel = me.findOrCreateEntryPanel(ancestor);
                ancestorEntryPanel.setCollapsed(true);
                me.down('#ancestorContainer').removeAll(false);
                me.down('#ancestorContainer').add(ancestorEntryPanel);
            }
        });
        me.down('#descendantsListLoadingLabel').setHidden(false);
        me.down('#descendantsContainer').removeAll(false);
        entry.whenDescendantsLoaded(function (loadedEntry) {
            if (loadedEntry === me.getEntry()) {
                me.down('#descendantsListLoadingLabel').setHidden(true);
                me.down('#descendantsContainer').removeAll(false);
                for (var i = 0; i < loadedEntry.get('descendants').length; i++) {
                    loadedEntry.get('descendants')[i].ensureFullyLoaded();
                    var descendantEntryPanel = me.findOrCreateEntryPanel(loadedEntry.get('descendants')[i]);
                    descendantEntryPanel.setCollapsed(true);
                    me.down('#descendantsContainer').add(descendantEntryPanel);
                }
            }
        });
        //Search EntryPanels for one with this entry

        me.setEntry(entry);
    },
    
    findOrCreateEntryPanel: function(entry){
        for(i = 0; i < me.__EntryPanels.length; i++){
            if(me.__EntryPanels[i].getEntry() == entry){
                return me.__EntryPanels[i]
            }
        }

        var entrypanel = Ext.widget('entrypanel', {
            entry: entry
        });
        me.__EntryPanels.push(entrypanel);
        return entrypanel;
    }
});
