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
        'Ext.TitleBar',
        'Ext.Label'
    ],

    config: {
        control: {
            '#entryLabel': {
                tap: 'onLabelTap'
            }
        },

        entry: null,
        collapsed: false,
        //centered: true,
        width: 300,
        items: [{
            xtype: 'button',
            html: '',
            itemId: 'entryLabel'
        }, {
            xtype: 'component',
            hidden: true,
            itemId: 'wikipediaImage',
            style: 'background:#ffffff'
        }]
    },

    updateEntry: function (newEntry, oldEntry) {
        var me = this;
        me.down('#wikipediaImage').setHidden(true);
        me.down('#entryLabel').setHtml(newEntry.get('name'));
        newEntry.whenLoaded(function (newEntry) {
            me.onEntryLoaded(newEntry);
        });
    },

    updateCollapsed: function(newCollapsed) {
        if(!newCollapsed && this.getEntry() && this.getEntry().get('wikipediaImage')){
            this.down('#wikipediaImage').setHtml('<img src="' + this.getEntry().get('wikipediaImage') + '"/>');
            this.down('#wikipediaImage').setHidden(false);
        }else{
            this.down('#wikipediaImage').setHidden(true);
        }
    },

    onEntryLoaded: function (newEntry) {
        if (newEntry === this.getEntry()) {
            var me = this;
            this.down('#entryLabel').setHtml(newEntry.get('name'));

            if (newEntry.get('wikipediaImage') && !me.getCollapsed()) {
                this.down('#wikipediaImage').setHtml('<img src="' + newEntry.get('wikipediaImage') + '"/>');
                this.down('#wikipediaImage').setHidden(false);
            }else{
                this.down('#wikipediaImage').setHidden(true);
            }
        }
    },

    onLabelTap: function () {
        var entry = this.getEntry();
        if (entry) {
            this.fireEvent('navigatetoentry', entry.get('name'));
        }
    }
});
