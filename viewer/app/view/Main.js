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
        'Ext.Video',
        'Ext.dataview.List',
        'Ext.Label'
    ],
    config: {
        control: {
            '#ancestorButton': {
                tap: 'onAncestorButtonTap'
            },
            '#descendantsList': {
                itemtap: function (list, index, target, record) {this.fireEvent('navigatetoentry', record.get('name')); }
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
            title: 'BioLadder.org - The Interactive Tree of Life Viewer and Wiki',
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
            xtype: 'container',
            itemId: 'entryContainer',
            items: [{
                xtype: 'label',
                html: '',
                itemId: 'entryLabel'
            }, {
                xtype: 'button',
                hidden: true,
                html: 'Ancestor:',
                itemId: 'ancestorButton'
            }, {
                xtype: 'component',
                hidden: true,
                itemId: 'wikipediaImage',
                style: 'background:#ffffff'
            }, {
                xtype: 'label',
                html: 'loading descendants...',
                itemId: 'descendantsListLoadingLabel'
            }, {
                xtype: 'list',
                disableSelection: true,
                height: '300px',
                hidden: true,
                itemId: 'descendantsList',
                itemTpl: 'Descendant: {name}'
            }]
        }]
    },

    updateEntry: function (newEntry, oldEntry) {
        var me = this;
        me.down('#descendantsListLoadingLabel').setHidden(false);
        me.down('#descendantsList').setHidden(true);
        me.down('#ancestorButton').setHidden(true);
        me.down('#wikipediaImage').setHidden(true);
        me.down('#entryLabel').setHtml('Current: ' + newEntry.get('name'));
        newEntry.whenLoaded(function (newEntry) {
            me.onEntryLoaded(newEntry);
            Ext.Viewport.setMasked(false);
        });
    },

    onEntryLoaded: function (newEntry) {
        if (newEntry === this.getEntry()) {
            var me = this;
            newEntry.whenDescendantsLoaded(function (entry) {me.setDescendants(entry); });
            if (newEntry.get('ancestor')) {
                newEntry.get('ancestor').ensureFullyLoaded();
                this.down('#ancestorButton').setHtml('Ancestor: ' + newEntry.get('ancestor').get('name'));
                this.down('#ancestorButton').setHidden(false);
            } else {
                this.down('#ancestorButton').setHidden(true);
            }
            this.down('#entryLabel').setHtml('Current: ' + newEntry.get('name'));

            if (newEntry.get('wikipediaImage')) {
                this.down('#wikipediaImage').setHtml('<img src="' + newEntry.get('wikipediaImage') + '"/>');
                this.down('#wikipediaImage').setHidden(false);
            }
        }
    },

    setDescendants: function (entry) {
        var store, index;
        if (entry === this.getEntry()) {
            if (entry.get('descendants').length > 0) {
                store = Ext.create("Ext.data.Store", {
                    model: "BioLadderOrg.model.Entry"
                });
                this.down('#descendantsList').setStore(store);
                this.down('#descendantsList').getStore().setData(entry.get('descendants'));
                this.down('#descendantsListLoadingLabel').setHidden(true);
                this.down('#descendantsList').setHidden(false);
                for (index in entry.get('descendants')) {
                    entry.get('descendants')[index].ensureFullyLoaded();
                }
            } else {
                this.down('#descendantsListLoadingLabel').setHidden(true);
                this.down('#descendantsList').setHidden(true);
            }
        }
    },

    onAncestorButtonTap: function () {
        var entry = this.getEntry();
        if (entry) {
            this.fireEvent('navigatetoentry', entry.get('ancestor').get('name'));
        }
    },

    gotoEntry: function (name) {
        Ext.Viewport.setMasked({
            xtype: 'loadmask'
        });
        var entriesStore, entry,
            me = this;
        //Search store for it, then load it, setting a callback
        entriesStore = Ext.getStore('Entries');

        entry = Ext.getStore('Entries').findOrCreateEntry(name);
        me.setEntry(entry);
    }
});
