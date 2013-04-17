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

Ext.define('BioLadderOrg.view.EntryPanel', {
    xtype: 'entrypanel',
    extend: 'Ext.Panel',

    requires: [
        'Ext.Label'
    ],

    config: {
        control: {
            '#entryLabel': {
                tap: 'onLabelTap'
            },
            '#wikiEditBtn': {
                tap: 'onWikiEditBtnTap'
            },
            '#wikipediaBtn': {
                tap: 'onWikipediaBtnTap'
            }
        },
        border: 1,
        cls: 'entry-panel',
        collapsed: false,
        entry: null,
        items: [{
            xtype: 'button',
            baseCls: 'entry-panel-label',
            html: '',
            itemId: 'entryLabel'
        }, {
            xtype: 'container',
            itemId: 'collapsibleContent',
            hidden: true,
            items: [{
                xtype: 'component',
                baseCls: 'wikipedia-image',
                itemId: 'wikipediaImage'
            }, {
                xtype: 'container',
                items: [{
                    xtype: 'button',
                    baseCls: 'link-btn',
                    html: 'edit',
                    itemId: 'wikiEditBtn',
                    width: '3em'
                }, {
                    xtype: 'button',
                    baseCls: 'link-btn',
                    docked: 'right',
                    hidden: true,
                    html: 'wikipedia page',
                    itemId: 'wikipediaBtn',
                    width: '9em'
                }]
            }]
        }],
        width: 300
    },

    updateEntry: function (newEntry, oldEntry) {
        var me = this;
        //reset view elements
        this.down('#wikipediaImage').setHtml('');
        this.down('#wikipediaBtn').setHidden(true);

        //set name and rest of fields when loaded
        me.down('#entryLabel').setHtml(newEntry.get('name'));
        newEntry.whenLoaded(function (newEntry) {
            me.onEntryLoaded(newEntry);
        });
    },

    updateCollapsed: function (newCollapsed) {
        if (newCollapsed) {
            this.setWidth(200);
            this.down('#collapsibleContent').setHidden(true);
        } else {
            this.setWidth(300);
            this.down('#collapsibleContent').setHidden(false);
        }
    },

    onEntryLoaded: function (newEntry) {
        if (newEntry === this.getEntry()) {
            var me = this;
            if (newEntry.get('wikipediaImage')) {
                this.down('#wikipediaImage').setHtml('<img src="' + newEntry.get('wikipediaImage') + '"/>');
            }
            if (newEntry.get('wikipediaPage')) {
                this.down('#wikipediaBtn').setHidden(false);
            }
        }
    },

    onWikiEditBtnTap: function () {
        var entry = this.getEntry();
        if (entry) {
            window.open(
                window.location.pathname.slice(0, window.location.pathname.search('/\/viewer/') - 7) +
                    '/wiki/index.php?title=' + entry.get('name') + '&action=edit',
                '_blank'
            );
        }
    },

    onWikipediaBtnTap: function () {
        var entry = this.getEntry();
        if (entry) {
            window.open(entry.get('wikipediaPage'), '_blank');
        }
    },

    onLabelTap: function () {
        var entry = this.getEntry();
        if (entry) {
            this.fireEvent('navigatetoentry', entry);
        }
    }
});
