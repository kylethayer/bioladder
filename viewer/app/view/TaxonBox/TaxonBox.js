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

Ext.define('BioLadderOrg.view.TaxonBox.TaxonBox', {
    xtype: 'taxonbox',
    extend: 'Ext.Panel',

    requires: [
        'Ext.Label',
        'Ext.String',
        'BioLadderOrg.view.TaxonBox.TaxonBoxContents'
    ],
    
    statics:{
        getHeight: function(isOpen){
            if(isOpen){
                return 293;
            }else{
                return 21;
            }
        },
        getWidth: function(isOpen){
            if(isOpen){
                return 500;
            }else{
                return 200;
            }
        }
    },

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
                xtype: 'taxonboxcontents',
                itemId: 'taxonBoxContents',
                height: '255px',
                scrollable: 'vertical'
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
        width: 500
    },

    updateTaxon: function (newTaxon, oldTaxon) {
        var me = this;
        //reset view elements
        me.down('#wikipediaBtn').setHidden(true);

        //set name and rest of fields when loaded
        me.updateTitle();
        me.down('#taxonBoxContents').setMasked({
            xtype: 'loadmask'
        });
        newTaxon.whenLoaded(function (newTaxon) {
            me.onTaxonLoaded(newTaxon);
            me.down('#taxonBoxContents').setMasked(false);
        });
    },

    updateCollapsed: function (newCollapsed) {
        var me = this;
        if (newCollapsed) {
            me.setWidth(200);
            me.down('#collapsibleContent').setHidden(true);
        } else {
            me.setWidth(500);
            me.down('#collapsibleContent').setHidden(false);
        }
        me.updateTitle();
    },

    onTaxonLoaded: function (newTaxon) {
        if (newTaxon === this.getTaxon()) { //make sure a delayed load of a previous taxon doesn't overwrite the current one
            var me = this;
            me.down('#taxonBoxContents').setData(newTaxon.data);
            me.updateTitle();
        
            if (newTaxon.get('wikipediaPage')) {
                this.down('#wikipediaBtn').setHidden(false);
            }
            if(newTaxon.get('exampleMember')) {
                var exampleMember = newTaxon.get('exampleMember');
                exampleMember.whenLoaded(function (exampleMember) {
                    //this.down('#taxonBoxContents').setData(newTaxon.data);
                    me.onExampleMemberLoaded(exampleMember);
                });
            }
            
        }
    },
    
    onExampleMemberLoaded: function (exampleMember) {
        if (exampleMember === this.getTaxon().get('exampleMember')) { //make sure a delayed load of a previous taxon doesn't overwrite the current one
            this.down('#taxonBoxContents').setData(this.getTaxon().data);
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
