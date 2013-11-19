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

Ext.define('BioLadderOrg.view.TaxonPanel', {
    xtype: 'taxonpanel',
    extend: 'Ext.Panel',

    requires: [
        'Ext.Label',
        'Ext.String'
    ],

    config: {
        control: {
            '#taxonLabel': {
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
        cls: 'taxon-panel',
        collapsed: false,
        taxon: null,
        items: [{
            xtype: 'button',
            baseCls: 'taxon-panel-label',
            html: '',
            itemId: 'taxonLabel'
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
                //hidden: true,
                items: [{
                    xtype: 'component',
                    html: '',
                    itemId: 'exampleMemberText'
                }, {
                    xtype: 'component',
                    baseCls: 'wikipedia-image',
                    itemId: 'exampleMemberImage'
                }, {
                    xtype: 'component',
                    html: '',
                    itemId: 'exampleMemberName'
                }],
                itemId: 'exampleMemberContainer'
            }, {
                xtype: 'component',
                html: '',
                itemId: 'scientificName'
            }, {
                xtype: 'component',
                html: '',
                itemId: 'otherNames'
            }, {
                xtype: 'component',
                html: '',
                itemId: 'description'
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

    updateTaxon: function (newTaxon, oldTaxon) {
        var me = this;
        //reset view elements
        me.down('#wikipediaImage').setHtml('');
        me.down('#wikipediaBtn').setHidden(true);
        me.down('#scientificName').setHtml('');
        me.down('#otherNames').setHtml('');
        me.down('#description').setHtml('');
        me.down('#exampleMemberContainer').setHidden(true);

        //set name and rest of fields when loaded
        me.updateTitle();
        newTaxon.whenLoaded(function (newTaxon) {
            me.onTaxonLoaded(newTaxon);
        });
    },

    updateCollapsed: function (newCollapsed) {
        var me = this;
        if (newCollapsed) {
            me.setWidth(200);
            me.down('#collapsibleContent').setHidden(true);
        } else {
            me.setWidth(400);
            me.down('#collapsibleContent').setHidden(false);
        }
        me.updateTitle();
    },

    onTaxonLoaded: function (newTaxon) {
        if (newTaxon === this.getTaxon()) { //make sure a delayed load of a previous taxon doesn't overwrite the current one
            var me = this;
            me.updateTitle();
        
            if (newTaxon.get('wikipediaImage')) {
                this.down('#wikipediaImage').setHtml('<img src="' + newTaxon.get('wikipediaImage') + '"/>');
            }
            if (newTaxon.get('wikipediaPage')) {
                this.down('#wikipediaBtn').setHidden(false);
            }
            if (newTaxon.get('scientificName')) {
                this.down('#scientificName').setHtml('<b>Scientific Name:</b> ' + Ext.String.htmlEncode(newTaxon.get('scientificName')));
            }
            if (newTaxon.get('otherNames')) {
                this.down('#otherNames').setHtml('<b>Other Names:</b> ' + Ext.String.htmlEncode(newTaxon.get('otherNames')));
            }
            if (newTaxon.get('description')) {
                this.down('#description').setHtml('<b>Description:</b> ' + Ext.String.htmlEncode(newTaxon.get('description')));
            }
            if(newTaxon.get('exampleMember')) {
                var exampleMember = newTaxon.get('exampleMember');
                this.down('#exampleMemberContainer').setHidden(false);
                me.down('#exampleMemberName').setHtml(exampleMember.get('name'));
                me.down('#exampleMemberText').setHtml(newTaxon.get('exampleMemberText'));
                this.down('#exampleMemberImage').setHtml('Loading...');
                exampleMember.whenLoaded(function (exampleMember) {
                    me.onExampleMemberLoaded(exampleMember);
                });
            }
            
        }
    },
    
    onExampleMemberLoaded: function (exampleMember) {
        if (exampleMember === this.getTaxon().get('exampleMember')) { //make sure a delayed load of a previous taxon doesn't overwrite the current one
            if(exampleMember.get('wikipediaImage')){
                this.down('#exampleMemberImage').setHtml('<img src="' + exampleMember.get('wikipediaImage') + '"/>');
            }else{
                this.down('#exampleMemberImage').setHtml('');
            }
        }
    },

    onWikiEditBtnTap: function () {
        var taxon = this.getTaxon();
        if (taxon) {
            window.open(
                window.location.pathname.slice(0, window.location.pathname.search('/\/viewer/') - 7) +
                    '/wiki/index.php?title=' + taxon.get('name') + '&action=formedit',
                '_blank'
            );
        }
    },

    onWikipediaBtnTap: function () {
        var taxon = this.getTaxon();
        if (taxon) {
            window.open(taxon.get('wikipediaPage'), '_blank');
        }
    },

    onLabelTap: function () {
        var taxon = this.getTaxon();
        if (taxon) {
            this.fireEvent('navigatetotaxon', taxon);
        }
    },
    
    updateTitle: function() {
        var me = this;
        if(me.getCollapsed() || !me.getTaxon().get('taxonomicRank')){
            me.down('#taxonLabel').setHtml(me.getTaxon().get('name'));
        } else {
            me.down('#taxonLabel').setHtml(me.getTaxon().get('name') + ' (' + Ext.String.htmlEncode(me.getTaxon().get('taxonomicRank')) + ')');
        }
    }
});
