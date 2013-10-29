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
 
Ext.define('BioLadderOrg.view.TaxaContainer', {
    xtype: 'taxacontainer',
    extend: 'Ext.Container',

    requires: [
        'Ext.Label',
        'BioLadderOrg.view.TaxonPanel'
    ],

    config: {
        control: {
            'taxonpanel': {
                navigatetotaxon: 'onNavigateToTaxon'
            },
            '#aboutSimplifiedAncestryBtn': {
                tap: function () {Ext.Viewport.add(Ext.widget('aboutSimplifiedAncestryPanel')); }
            }
        },

        taxon: null,

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
            itemId: 'taxonContainer'
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
        this.__TaxonPanels = [];
    },

    onNavigateToTaxon: function (taxon) {
        if (this.getTaxon() !== taxon) {
            this.fireEvent('navigatetotaxon', taxon.get('name'));
        }
    },

    gotoTaxon: function (name) {
        Ext.Viewport.setMasked({
            xtype: 'loadmask'
        });
        var taxon, i, currentTaxonPanel,
            me = this;

        taxon = Ext.getStore('Taxa').findOrCreateTaxon(name);

        me.setTaxon(taxon);

        //display current taxon
        me.down('#taxonContainer').removeAll(false); //clear the taxonContainer without deleting the TaxonPanels
        currentTaxonPanel = me.findOrCreateTaxonPanel(taxon);
        currentTaxonPanel.setCollapsed(false);
        me.down('#taxonContainer').add(currentTaxonPanel);

        //display simplifiedAncestors
        me.down('#simplifiedAncestorContainer').removeAll(false);
        me.down('#simplifiedAncestorsListLoadingLabel').setHidden(false);
        me.down('#simplifiedAncestorLabel').setHidden(true);
        taxon.whenLoaded(function (loadedTaxon) {
            var simplifiedAncestor, simplifiedAncestorTaxonPanel;
            if (loadedTaxon === me.getTaxon()) {
                Ext.Viewport.setMasked(false);
                simplifiedAncestor = loadedTaxon.get('simplifiedAncestor');
                me.down('#simplifiedAncestorsListLoadingLabel').setHidden(true);
                if (simplifiedAncestor) {
                    me.down('#simplifiedAncestorLabel').setHidden(false);
                    simplifiedAncestor.ensureFullyLoaded();
                    simplifiedAncestorTaxonPanel = me.findOrCreateTaxonPanel(simplifiedAncestor);
                    simplifiedAncestorTaxonPanel.setCollapsed(true);
                    me.down('#simplifiedAncestorContainer').removeAll(false);
                    me.down('#simplifiedAncestorContainer').add(simplifiedAncestorTaxonPanel);
                    if(firstTimeLoad){ //show instructions first time
                        me.down('#simplifiedAncestorContainer').add({
                            xtype: 'label',
                            html: '^ click above ^',
                        });
                        me.down('#simplifiedAncestorContainer').add({xtype: 'component', height: 10});
                        firstTimeLoad = false;
                    }
                }
            }
        });

        //display simplifiedDescendants
        me.down('#simplifiedDescendantsListLoadingLabel').setHidden(false);
        me.down('#simplifiedDescendantsContainer').removeAll(false);
        me.down('#simplifiedDescendantsLabel').setHidden(true);
        taxon.whenSimplifiedDescendantsLoaded(function (loadedTaxon) {
            var i, descendantTaxonPanel;
            if (loadedTaxon === me.getTaxon()) {
                me.down('#simplifiedDescendantsListLoadingLabel').setHidden(true);
                me.down('#simplifiedDescendantsContainer').removeAll(false);
                if (loadedTaxon.get('simplifiedDescendants').length > 0) {
                    me.down('#simplifiedDescendantsLabel').setHidden(false);
                    for (i = 0; i < loadedTaxon.get('simplifiedDescendants').length; i++) {
                        var descContainer = Ext.widget('container', {
                            itemId: 'descCont_' +loadedTaxon.get('simplifiedDescendants')[i].get('name'),
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
                        
                        loadedTaxon.get('simplifiedDescendants')[i].ensureFullyLoaded();
                        descendantTaxonPanel = me.findOrCreateTaxonPanel(loadedTaxon.get('simplifiedDescendants')[i]);
                        descendantTaxonPanel.setCollapsed(true);
                        descContainer.add(descendantTaxonPanel);
                        descContainer.add(popDescContainer);
                        
                        //Display popular descendants when they are loaded
                        me.addPopularDescendantsWhenLoaded(popDescContainer, loadedTaxon.get('simplifiedDescendants')[i]);
                        
                        //Make sure one more level of descendants are loaded so popular descendants show up
                        loadedTaxon.get('simplifiedDescendants')[i].whenSimplifiedDescendantsLoaded(function (loadedDescTaxon) {
                            if(loadedDescTaxon.get('simplifiedDescendants')){
                                for(var j = 0; j < loadedDescTaxon.get('simplifiedDescendants').length; j++){
                                    loadedDescTaxon.get('simplifiedDescendants')[j].ensureFullyLoaded();
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

    findOrCreateTaxonPanel: function (taxon) {
        var i, taxonpanel, me = this;
        for (i = 0; i < me.__TaxonPanels.length; i++) {
            if (me.__TaxonPanels[i].getTaxon() === taxon) {
                return me.__TaxonPanels[i];
            }
        }

        taxonpanel = Ext.widget('taxonpanel', {
            taxon: taxon
        });
        me.__TaxonPanels.push(taxonpanel);
        return taxonpanel;
    },
    
    addPopularDescendantsWhenLoaded: function(popDescContainer, taxon){
        var me = this;
        taxon.whenSimplifiedDescendantsLoaded(function (loadedDescTaxon) {
            popDescContainer.removeAll(true);
            if(loadedDescTaxon.get('popularDescendants') && loadedDescTaxon.get('popularDescendants').length > 0) {
                popDescContainer.add({xtype: 'label', html: '<b>:</b>'});
                popDescContainer.add({xtype: 'label', html: '<b>:</b>'});
                var popularDescendants = loadedDescTaxon.get('popularDescendants');
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
                    var panel = me.findOrCreateTaxonPanel(popularDescendants[i]);
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
