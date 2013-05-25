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
        'BioLadderOrg.view.AboutSimplifiedAncestryPanel',
        'BioLadderOrg.view.EntriesContainer',
        'BioLadderOrg.view.HowToHelpPanel'
    ],
    config: {
        control: {
            'entriescontainer': {
                navigatetoentry: function (entryName) {this.fireEvent('navigatetoentry', entryName); }
            },
            '#howToHelpBtn': {
                tap: function() {Ext.Viewport.add(Ext.widget('howToHelpPanel')); }
            }
        },

        items: [{
            docked: 'top',
            xtype: 'titlebar',
            title: 'BioLadder.org - The Interactive Tree of Life Viewer and Wiki (for IE10, Safari and Chrome)',
            items: [{
                xtype: 'button',
                html: 'How To Help',
                itemId: 'howToHelpBtn'
            }]
        }, {
            xtype: 'entriescontainer'
        }]
    },

    gotoEntry: function (name) {
        this.down('entriescontainer').gotoEntry(name);
    }
});
