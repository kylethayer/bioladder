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
        'BioLadderOrg.view.AboutCladesPanel',
        'BioLadderOrg.view.TaxaContainer',
        'BioLadderOrg.view.HowToHelpPanel',
        'BioLadderOrg.view.SearchPanel'
    ],
    config: {
        control: {
            'taxacontainer': {
                navigatetotaxon: function (taxonName) {this.fireEvent('navigatetotaxon', taxonName); }
            },
            '#howToHelpBtn': {
                tap: function() {Ext.Viewport.add(Ext.widget('howToHelpPanel')); }
            },
            '#searchBtn': {
                tap: function() {Ext.Viewport.add(Ext.widget('searchPanel')); }
            },
            '#helpBtn': {
                tap: function() {Ext.Viewport.add(Ext.widget('aboutCladesPanel')); }
            }
        },

        items: [{
            docked: 'top',
            xtype: 'titlebar',
            title: 'BioLadder - The Interactive Tree of Life Viewer and Wiki',
            items: [{
                xtype: 'button',
                align: 'left',
                html: 'How To Help',
                itemId: 'howToHelpBtn'
            }, {
                xtype: 'button',
                align: 'right',
                iconCls: 'search',
                itemId: 'searchBtn'
            }, {
                xtype: 'button',
                align: 'right',
                html: '<span style="font-size:16pt;">?<span>',
                itemId: 'helpBtn'
            }]
        }, {
            xtype: 'taxacontainer'
        }]
    },

    gotoTaxon: function (name) {
        this.down('taxacontainer').gotoTaxon(name);
    }
});
