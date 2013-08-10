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

 var firstTimeLoad = true;
 
Ext.define('BioLadderOrg.view.EntriesContainer', {
    xtype: 'entriescontainer',
    extend: 'Ext.Container',

    requires: [
        'Ext.Label',
        'BioLadderOrg.view.EntryPanel'
    ],

    config: {
        control: {
            'entrypanel': {
                navigatetoentry: 'onNavigateToEntry'
            },
            '#aboutSimplifiedAncestryBtn': {
                tap: function () {Ext.Viewport.add(Ext.widget('aboutSimplifiedAncestryPanel')); }
            }
        },

        entry: null,

        items: [{
            xtype: 'container',
            layout: 'hbox',
            itemId: 'simplifiedAncestorLabel',
            items:[{
                xtype: 'label',
                html: 'Simplified Ancestor'
            }, {
                xtype: 'button',
                baseCls: 'no-underline-link-btn',
                html: '[?]',
                itemId: 'aboutSimplifiedAncestryBtn'
            }]
        }, {
            xtype: 'label',
            html: 'loading simplified ancestor...',
            itemId: 'simplifiedAncestorsListLoadingLabel'
        }, {
            xtype: 'container',
            itemId: 'simplifiedAncestorContainer',
            layout: {
                type: 'vbox',
                align: 'middle'
            }
        }, {
            xtype: 'component',
            height: 20
        }, {
            xtype: 'container',
            itemId: 'entryContainer'
        }, {
            xtype: 'component',
            height: 20
        }, {
            xtype: 'container',
            layout: 'hbox',
            itemId: 'simplifiedDescendantsLabel',
            items: [{
                xtype: 'label',
                html: 'Simplified Descendants'
            }, {
                xtype: 'button',
                baseCls: 'no-underline-link-btn',
                html: '[?]',
                itemId: 'aboutSimplifiedAncestryBtn'
            }]
        }, {
            xtype: 'label',
            html: 'loading simplified descendants...',
            itemId: 'simplifiedDescendantsListLoadingLabel'
        }, {
            xtype: 'container',
            itemId: 'simplifiedDescendantsContainer',
            layout: 'hbox'
        }, {
            xtype: 'component',
            height: 20
        }],

        layout: {
            type: 'vbox',
            align: 'middle'
        },
        height: '100%',
        width: '100%',
        scrollable: 'both'
    },

    initialize: function () {
        this.__EntryPanels = [];
    },

    onNavigateToEntry: function (entry) {
        if (this.getEntry() !== entry) {
            this.fireEvent('navigatetoentry', entry.get('name'));
        }
    },

    gotoEntry: function (name) {
        Ext.Viewport.setMasked({
            xtype: 'loadmask'
        });
        var entry, i, currentEntryPanel,
            me = this;

        entry = Ext.getStore('Entries').findOrCreateEntry(name);

        me.setEntry(entry);

        //display current entry
        me.down('#entryContainer').removeAll(false); //clear the entryContainer without deleting the EntryPanels
        currentEntryPanel = me.findOrCreateEntryPanel(entry);
        currentEntryPanel.setCollapsed(false);
        me.down('#entryContainer').add(currentEntryPanel);

        //display simplifiedAncestors
        me.down('#simplifiedAncestorContainer').removeAll(false);
        me.down('#simplifiedAncestorsListLoadingLabel').setHidden(false);
        me.down('#simplifiedAncestorLabel').setHidden(true);
        entry.whenLoaded(function (loadedEntry) {
            var simplifiedAncestor, simplifiedAncestorEntryPanel;
            if (loadedEntry === me.getEntry()) {
                Ext.Viewport.setMasked(false);
                simplifiedAncestor = loadedEntry.get('simplifiedAncestor');
                me.down('#simplifiedAncestorsListLoadingLabel').setHidden(true);
                if (simplifiedAncestor) {
                    me.down('#simplifiedAncestorLabel').setHidden(false);
                    simplifiedAncestor.ensureFullyLoaded();
                    simplifiedAncestorEntryPanel = me.findOrCreateEntryPanel(simplifiedAncestor);
                    simplifiedAncestorEntryPanel.setCollapsed(true);
                    me.down('#simplifiedAncestorContainer').removeAll(false);
                    me.down('#simplifiedAncestorContainer').add(simplifiedAncestorEntryPanel);
                    if(firstTimeLoad){ //show instructions first time
                        me.down('#simplifiedAncestorContainer').add({
                            xtype: 'label',
                            html: '<b>^ click here ^<b>',
                        });
                        me.down('#simplifiedAncestorContainer').add({xtype: 'component', height: 20});
                        firstTimeLoad = false;
                    }
                }
            }
        });

        //display simplifiedDescendants
        me.down('#simplifiedDescendantsListLoadingLabel').setHidden(false);
        me.down('#simplifiedDescendantsContainer').removeAll(false);
        me.down('#simplifiedDescendantsLabel').setHidden(true);
        entry.whenSimplifiedDescendantsLoaded(function (loadedEntry) {
            var i, descendantEntryPanel;
            if (loadedEntry === me.getEntry()) {
                me.down('#simplifiedDescendantsListLoadingLabel').setHidden(true);
                me.down('#simplifiedDescendantsContainer').removeAll(false);
                if (loadedEntry.get('simplifiedDescendants').length > 0) {
                    me.down('#simplifiedDescendantsLabel').setHidden(false);
                    for (i = 0; i < loadedEntry.get('simplifiedDescendants').length; i++) {
                        var descContainer = Ext.widget('container', {
                            itemId: 'descCont_' +loadedEntry.get('simplifiedDescendants')[i].get('name'),
                            layout: {type: 'vbox', align: 'center'}
                        });

                        var popDescContainer =  Ext.widget('container', {
                            layout: {type: 'vbox', align: 'center'},
                            items:[
                                {xtype: 'label', html: '<b>:</b>'}, 
                                { xtype: 'label', html: '<b>:</b>'}, 
                                {xtype: 'label', html: 'Loading...'}
                            ]
                        });
                        
                        loadedEntry.get('simplifiedDescendants')[i].ensureFullyLoaded();
                        descendantEntryPanel = me.findOrCreateEntryPanel(loadedEntry.get('simplifiedDescendants')[i]);
                        descendantEntryPanel.setCollapsed(true);
                        descContainer.add(descendantEntryPanel);
                        descContainer.add(popDescContainer);
                        
                        //Display popular descendants when they are loaded
                        me.addPopularDescendantsWhenLoaded(popDescContainer, loadedEntry.get('simplifiedDescendants')[i]);
                        
                        //Make sure one more level of descendants are loaded so popular descendants show up
                        loadedEntry.get('simplifiedDescendants')[i].whenSimplifiedDescendantsLoaded(function (loadedDescEntry) {
                            if(loadedDescEntry.get('simplifiedDescendants')){
                                for(var j = 0; j < loadedDescEntry.get('simplifiedDescendants').length; j++){
                                    loadedDescEntry.get('simplifiedDescendants')[j].ensureFullyLoaded();
                                }
                            }
                        });
                        
                        me.down('#simplifiedDescendantsContainer').add(descContainer);
                        
                        me.down('#simplifiedDescendantsContainer').add({xtype: 'component',width: 10});
                    }
                }
            }
        });
    },

    findOrCreateEntryPanel: function (entry) {
        var i, entrypanel, me = this;
        for (i = 0; i < me.__EntryPanels.length; i++) {
            if (me.__EntryPanels[i].getEntry() === entry) {
                return me.__EntryPanels[i];
            }
        }

        entrypanel = Ext.widget('entrypanel', {
            entry: entry
        });
        me.__EntryPanels.push(entrypanel);
        return entrypanel;
    },
    
    addPopularDescendantsWhenLoaded: function(popDescContainer, entry){
        var me = this;
        entry.whenSimplifiedDescendantsLoaded(function (loadedDescEntry) {
            popDescContainer.removeAll(true);
            if(loadedDescEntry.get('popularDescendants') && loadedDescEntry.get('popularDescendants').length > 0) {
                popDescContainer.add({xtype: 'label', html: '<b>:</b>'});
                popDescContainer.add({xtype: 'label', html: '<b>:</b>'});
                var popularDescendants = loadedDescEntry.get('popularDescendants');
                var xTranslate = -75;
                if(popularDescendants.length == 1){
                    xTranslate = -92;
                }
                var popDescPanelsContainer =  Ext.widget('container', {
                    //this panel is rotated so it doesn't imply that one popular descendant is ranked above another
                    // rotate for Safari, Firefox, IE, Opera, Internet Explorer 
                    style: '-webkit-transform: rotate(-90deg) translateX('+xTranslate+'px);'+ //safari and chrome
                        ' -moz-transform: rotate(-90deg) translateX('+xTranslate+'px);'+ //firefox
                        ' transform: rotate(-90deg) translateX('+xTranslate+'px);'+ //ie10
                        ' -o-transform: rotate(-90deg) translateX('+xTranslate+'px);' //opera
                });
                var firstDesc = true;
                for(i = 0; i < popularDescendants.length; i++){
                    if(!firstDesc){
                        popDescPanelsContainer.add({xtype: 'component',width: 10, height: 10});
                    }
                    firstDesc = false;
                    var panel = me.findOrCreateEntryPanel(popularDescendants[i]);
                    panel.setCollapsed(true);
                    popDescPanelsContainer.add(panel);
                }
                popDescContainer.add(popDescPanelsContainer);
                if(popularDescendants.length > 0){//This is a hack to add more space since I had to use a hack to rotate the popular descendants.
                    popDescContainer.add({xtype: 'component', height: 180});
                }
            }
        });
    }
});
