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
            html: 'Simplified Ancestor',
            itemId: 'simplifiedAncestorLabel'
        }, {
            xtype: 'label',
            html: 'loading simplified ancestor...',
            itemId: 'simplifiedAncestorsListLoadingLabel'
        }, {
            xtype: 'container',
            itemId: 'simplifiedAncestorContainer'
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
            html: 'Simplified Descendants',
            itemId: 'simplifiedDescendantsLabel'
        }, {
            xtype: 'label',
            html: 'loading simplified descendants...',
            itemId: 'simplifiedDescendantsListLoadingLabel'
        }, {
            xtype: 'container',
            itemId: 'simplifiedDescendantsContainer',
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
                        loadedEntry.get('simplifiedDescendants')[i].ensureFullyLoaded();
                        descendantEntryPanel = me.findOrCreateEntryPanel(loadedEntry.get('simplifiedDescendants')[i]);
                        descendantEntryPanel.setCollapsed(true);
                        me.down('#simplifiedDescendantsContainer').add(descendantEntryPanel);
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
