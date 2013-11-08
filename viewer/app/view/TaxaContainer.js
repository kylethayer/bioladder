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
            itemId: 'parentTaxonLabel',
            items:[{
                xtype: 'label',
                html: 'Parent Taxon'
            }, {
                xtype: 'button',
                baseCls: 'no-underline-link-btn',
                html: '[?]',
                itemId: 'aboutSimplifiedAncestryBtn'
            }]
        }, {
            xtype: 'label',
            html: 'loading parent taxon...',
            itemId: 'parentTaxonsListLoadingLabel'
        }, {
            xtype: 'container',
            itemId: 'parentTaxonContainer',
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
            itemId: 'subTaxaLabel',
            items: [{
                xtype: 'label',
                html: 'Sub-Taxa'
            }, {
                xtype: 'button',
                baseCls: 'no-underline-link-btn',
                html: '[?]',
                itemId: 'aboutSimplifiedAncestryBtn'
            }]
        }, {
            xtype: 'label',
            html: 'loading sub-taxa...',
            itemId: 'subTaxaListLoadingLabel'
        }, {
            xtype: 'container',
            itemId: 'subTaxaContainer',
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

        //display parentTaxons
        me.down('#parentTaxonContainer').removeAll(false);
        me.down('#parentTaxonsListLoadingLabel').setHidden(false);
        me.down('#parentTaxonLabel').setHidden(true);
        taxon.whenLoaded(function (loadedTaxon) {
            var parentTaxon, parentTaxonPanel;
            if (loadedTaxon === me.getTaxon()) {
                Ext.Viewport.setMasked(false);
                parentTaxon = loadedTaxon.get('parentTaxon');
                me.down('#parentTaxonsListLoadingLabel').setHidden(true);
                if (parentTaxon) {
                    me.down('#parentTaxonLabel').setHidden(false);
                    parentTaxon.ensureFullyLoaded();
                    parentTaxonPanel = me.findOrCreateTaxonPanel(parentTaxon);
                    parentTaxonPanel.setCollapsed(true);
                    me.down('#parentTaxonContainer').removeAll(false);
                    me.down('#parentTaxonContainer').add(parentTaxonPanel);
                    if(firstTimeLoad){ //show instructions first time
                        me.down('#parentTaxonContainer').add({
                            xtype: 'label',
                            html: '^ click above ^',
                        });
                        me.down('#parentTaxonContainer').add({xtype: 'component', height: 10});
                        firstTimeLoad = false;
                    }
                }
            }
        });

        //display subTaxa
        me.down('#subTaxaListLoadingLabel').setHidden(false);
        me.down('#subTaxaContainer').removeAll(false);
        me.down('#subTaxaLabel').setHidden(true);
        taxon.whenSubTaxaLoaded(function (loadedTaxon) {
            var i, descendantTaxonPanel;
            if (loadedTaxon === me.getTaxon()) {
                me.down('#subTaxaListLoadingLabel').setHidden(true);
                me.down('#subTaxaContainer').removeAll(false);
                if (loadedTaxon.get('subTaxa').length > 0) {
                    me.down('#subTaxaLabel').setHidden(false);
                    for (i = 0; i < loadedTaxon.get('subTaxa').length; i++) {
                        var descContainer = Ext.widget('container', {
                            itemId: 'descCont_' +loadedTaxon.get('subTaxa')[i].get('name'),
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
                        
                        loadedTaxon.get('subTaxa')[i].ensureFullyLoaded();
                        descendantTaxonPanel = me.findOrCreateTaxonPanel(loadedTaxon.get('subTaxa')[i]);
                        descendantTaxonPanel.setCollapsed(true);
                        descContainer.add(descendantTaxonPanel);
                        descContainer.add(popDescContainer);
                        
                        //Display popular descendants when they are loaded
                        me.addPopularDescendantsWhenLoaded(popDescContainer, loadedTaxon.get('subTaxa')[i]);
                        
                        //Make sure one more level of descendants are loaded so popular descendants show up
                        loadedTaxon.get('subTaxa')[i].whenSubTaxaLoaded(function (loadedDescTaxon) {
                            if(loadedDescTaxon.get('subTaxa')){
                                for(var j = 0; j < loadedDescTaxon.get('subTaxa').length; j++){
                                    loadedDescTaxon.get('subTaxa')[j].ensureFullyLoaded();
                                }
                            }
                        });
                        
                        me.down('#subTaxaContainer').add(descContainer);
                        
                        me.down('#subTaxaContainer').add({xtype: 'component',width: 10});
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
        taxon.whenSubTaxaLoaded(function (loadedDescTaxon) {
            popDescContainer.removeAll(true);
            if(loadedDescTaxon.get('popularSubTaxa') && loadedDescTaxon.get('popularSubTaxa').length > 0) {
                popDescContainer.add({xtype: 'label', html: '<b>:</b>'});
                popDescContainer.add({xtype: 'label', html: '<b>:</b>'});
                var popularSubTaxa = loadedDescTaxon.get('popularSubTaxa');
                var xTranslate = -75;
                if(popularSubTaxa.length == 1){
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
                for(i = 0; i < popularSubTaxa.length; i++){
                    if(!firstDesc){
                        popDescPanelsContainer.add({xtype: 'component',width: 10, height: 10});
                    }
                    firstDesc = false;
                    var panel = me.findOrCreateTaxonPanel(popularSubTaxa[i]);
                    panel.setCollapsed(true);
                    popDescPanelsContainer.add(panel);
                }
                popDescContainer.add(popDescPanelsContainer);
                if(popularSubTaxa.length > 0){//This is a hack to add more space since I had to use a hack to rotate the popular descendants.
                    popDescContainer.add({xtype: 'component', height: 180});
                }
            }
        });
    }
});
