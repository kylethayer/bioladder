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
            }
        },

        entry: null,

        items: [{
            xtype: 'label',
            html: 'Ancestor',
            itemId: 'ancestorLabel'
        }, {
            xtype: 'label',
            html: 'loading ancestor...',
            itemId: 'ancestorsListLoadingLabel'
        }, {
            xtype: 'container',
            itemId: 'ancestorContainer'
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
            xtype: 'label',
            html: 'Descendants',
            itemId: 'descendantsLabel'
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

        //display ancestors
        me.down('#ancestorContainer').removeAll(false);
        me.down('#ancestorsListLoadingLabel').setHidden(false);
        me.down('#ancestorLabel').setHidden(true);
        entry.whenLoaded(function (loadedEntry) {
            var ancestor, ancestorEntryPanel;
            if (loadedEntry === me.getEntry()) {
                Ext.Viewport.setMasked(false);
                ancestor = loadedEntry.get('ancestor');
                me.down('#ancestorsListLoadingLabel').setHidden(true);
                if (ancestor) {
                    me.down('#ancestorLabel').setHidden(false);
                    ancestor.ensureFullyLoaded();
                    ancestorEntryPanel = me.findOrCreateEntryPanel(ancestor);
                    ancestorEntryPanel.setCollapsed(true);
                    me.down('#ancestorContainer').removeAll(false);
                    me.down('#ancestorContainer').add(ancestorEntryPanel);
                }
            }
        });

        //display descendants
        me.down('#descendantsListLoadingLabel').setHidden(false);
        me.down('#descendantsContainer').removeAll(false);
        me.down('#descendantsLabel').setHidden(true);
        entry.whenDescendantsLoaded(function (loadedEntry) {
            var i, descendantEntryPanel;
            if (loadedEntry === me.getEntry()) {
                me.down('#descendantsListLoadingLabel').setHidden(true);
                me.down('#descendantsContainer').removeAll(false);
                if (loadedEntry.get('descendants').length > 0) {
                    me.down('#descendantsLabel').setHidden(false);
                    for (i = 0; i < loadedEntry.get('descendants').length; i++) {
                        loadedEntry.get('descendants')[i].ensureFullyLoaded();
                        descendantEntryPanel = me.findOrCreateEntryPanel(loadedEntry.get('descendants')[i]);
                        descendantEntryPanel.setCollapsed(true);
                        me.down('#descendantsContainer').add(descendantEntryPanel);
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
    }
});
