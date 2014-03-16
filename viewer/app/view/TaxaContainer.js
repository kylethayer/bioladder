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
        'BioLadderOrg.view.TaxonBox.TaxonBox',
        'BioLadderOrg.view.TaxaContainerPositionCalculator',
        'BioLadderOrg.view.ElbowConnector',
        'BioLadderOrg.view.LoadingSpinner'
    ],

    config: {
        control: {
            'taxonbox': {
                navigatetotaxon: 'onNavigateToTaxon'
            },
            '#aboutCladesBtn': {
                tap: function () {Ext.Viewport.add(Ext.widget('aboutCladesPanel')); }
            }
        },
        taxon: null,
        height: '100%',
        width: '100%',
        //scrollable: 'both' //dissabled until I can get the scrollable taxon box not to scroll this as well
    },

    initialize: function () {
        this.__TaxonBoxes = [];
    },

    onNavigateToTaxon: function (taxon) {
        if (this.getTaxon() !== taxon) {
            this.fireEvent('navigatetotaxon', taxon.get('name'));
        }
    },

    gotoTaxon: function (name) {
        var taxon, i, currentTaxonBox,
            me = this,
            posCalc = BioLadderOrg.view.TaxaContainerPositionCalculator;

        taxon = Ext.getStore('Taxa').findOrCreateTaxon(name);

        me.setTaxon(taxon);
        //clear current display
        me.removeAll(false, true);
        
        var cladeLegend = me.add({
            xtype: 'button', //button allows tap event capture
            baseCls: 'no-formatting',
            html: '<span style="font-size:10px">Parent Clade</span> <span id="aboutCladesBtn" class="no-underline-link-btn" style="font-size:10px">[?]</span><br>&#8593;<br>&#8595;<br><span style="font-size:10px">Child Clade</span> <span id="aboutCladesBtn" class="no-underline-link-btn" style="font-size:10px">[?]</span>',
            top: 5,
            left: 5,
            listeners: {
                tap: function(obj, e){
                    if(e.target.id == "aboutCladesBtn"){
                        Ext.Viewport.add(Ext.widget('aboutCladesPanel'));
                    }
                },
            }
         });
        
        //display current taxon
        currentTaxonBox = me.findOrCreateTaxonBox(taxon);
        currentTaxonBox.setCollapsed(false);
        var taxonPos = posCalc.getPosition(me, 0, 0);
        currentTaxonBox.setLeft(taxonPos[0]);
        currentTaxonBox.setTop(taxonPos[1]);
        me.add(currentTaxonBox);

        var parentLoadingSpinner = me.add({
            xtype: 'loadingspinner',
            centerY: taxonPos[1] - 30,
            centerX: taxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(true) / 2 
        });
        
        var childrenLoadingSpinner = me.add({
            xtype: 'loadingspinner',
            centerY: taxonPos[1] + BioLadderOrg.view.TaxonBox.TaxonBox.getHeight(true) + 40,
            centerX: taxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(true) / 2 ,
        });
        
        //display parentTaxon
        taxon.whenLoaded(function (loadedTaxon) {
            var parentTaxon, parentTaxonBox;
            if (loadedTaxon === me.getTaxon()) {
                Ext.Viewport.setMasked(false);
                parentTaxon = loadedTaxon.get('parentTaxon');
                parentLoadingSpinner.destroy();
                if (parentTaxon) {
                    parentTaxon.ensureFullyLoaded();
                    parentTaxonBox = me.findOrCreateTaxonBox(parentTaxon);
                    parentTaxonBox.setCollapsed(true);
                    var parentTaxonPos = posCalc.getPosition(me, -1, 0);
                    parentTaxonBox.setLeft(parentTaxonPos[0]);
                    parentTaxonBox.setTop(parentTaxonPos[1]);
                    me.add(parentTaxonBox);
                    me.add({
                        xtype: 'elbowconnector',
                        startX: parentTaxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(false) / 2,
                        endX: parentTaxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(false) / 2,
                        startY: parentTaxonPos[1] + BioLadderOrg.view.TaxonBox.TaxonBox.getHeight(false),
                        endY: parentTaxonPos[1] + BioLadderOrg.view.TaxonBox.TaxonBox.getHeight(false) + 20
                    });
                    
                    var grandParentLoadingSpinner = me.add({
                        xtype: 'loadingspinner',
                        centerY: parentTaxonPos[1] - 6,
                        centerX: parentTaxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(false) / 2,
                        scale: .15
                    });
                    parentTaxon.whenLoaded(function (loadedTaxon) {
                        if(taxon === me.getTaxon()){
                            var grandParentTaxon = loadedTaxon.get('parentTaxon');
                            grandParentLoadingSpinner.destroy();
                            if(grandParentTaxon){
                                grandParentTaxon.ensureFullyLoaded();
                                me.add({
                                    xtype: 'elbowconnector',
                                    startX: parentTaxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(false) / 2,
                                    endX: parentTaxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(false) / 2,
                                    startY: parentTaxonPos[1] - 10,
                                    endY: parentTaxonPos[1]
                                });
                            }
                        }
                    });
                }
            }
        });

        //display subTaxa
        taxon.whenSubTaxaLoaded(function (loadedTaxon) {
            var i, descendantTaxonBox;
            if (loadedTaxon === me.getTaxon()) {
                childrenLoadingSpinner.destroy();
                if (loadedTaxon.get('subTaxa').length > 0) {
                    for (i = 0; i < loadedTaxon.get('subTaxa').length; i++) {
                        
                        loadedTaxon.get('subTaxa')[i].ensureFullyLoaded();
                        descendantTaxonBox = me.findOrCreateTaxonBox(loadedTaxon.get('subTaxa')[i]);
                        descendantTaxonBox.setCollapsed(true);
                        var subTaxaPos = posCalc.getPosition(me, 1, i, loadedTaxon.get('subTaxa').length);
                        descendantTaxonBox.setLeft(subTaxaPos[0]);
                        descendantTaxonBox.setTop(subTaxaPos[1]);
                        me.add(descendantTaxonBox);
                        me.add({
                            xtype: 'elbowconnector',
                            startX: taxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(true) / 2,
                            endX: subTaxaPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(false) / 2,
                            startY: subTaxaPos[1] - 40,
                            endY: subTaxaPos[1]
                        });
                        
                        //Display popular descendants when they are loaded
                        me.addPopularDescendantsWhenLoaded(taxon, loadedTaxon.get('subTaxa')[i], subTaxaPos);
                        
                        //Make sure one more level of descendants are loaded so popular descendants show up
                        loadedTaxon.get('subTaxa')[i].whenSubTaxaLoaded(function (loadedDescTaxon) {
                            if(loadedDescTaxon.get('subTaxa')){
                                for(var j = 0; j < loadedDescTaxon.get('subTaxa').length; j++){
                                    loadedDescTaxon.get('subTaxa')[j].ensureFullyLoaded();
                                }
                            }
                        });
                    }
                }
            }
        });
    },

    findOrCreateTaxonBox: function (taxon) {
        var i, taxonbox, me = this;
        for (i = 0; i < me.__TaxonBoxes.length; i++) {
            if (me.__TaxonBoxes[i].getTaxon() === taxon) {
                //clear rotation before returning
                me.__TaxonBoxes[i].setStyle(
                    '-webkit-transform: rotate(0);'+ //safari and chrome
                    ' -moz-transform: rotate(0);'+ //firefox
                    ' transform: rotate(0);'+ //ie10
                    ' -o-transform: rotate(0);' //opera
                );
                return me.__TaxonBoxes[i];
            }
        }

        taxonbox = Ext.widget('taxonbox', {
            taxon: taxon
        });
        me.__TaxonBoxes.push(taxonbox);
        return taxonbox;
    },
    
    addPopularDescendantsWhenLoaded: function(pageTaxon, taxon, parentPosition){
        var me = this,
            taxonBox = BioLadderOrg.view.TaxonBox.TaxonBox;
            
        var popSubtaxaLoadingSpinner = me.add({
            xtype: 'loadingspinner',
            centerY: parentPosition[1] + BioLadderOrg.view.TaxonBox.TaxonBox.getHeight(false) + 40,
            centerX: parentPosition[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(false) / 2 ,
        });
        
        taxon.whenSubTaxaLoaded(function (loadedDescTaxon) {
            if (pageTaxon === me.getTaxon()) {//check that correct taxon is still up
                popSubtaxaLoadingSpinner.destroy();
                if(loadedDescTaxon.get('popularSubTaxa') && loadedDescTaxon.get('popularSubTaxa').length > 0) {
                    var popularSubTaxa = loadedDescTaxon.get('popularSubTaxa');
                    for(var i = 0; i < popularSubTaxa.length; i++){
                        var popSubtaxonBox = me.findOrCreateTaxonBox(popularSubTaxa[i]);
                        popSubtaxonBox.setCollapsed(true);
                        var pos = BioLadderOrg.view.TaxaContainerPositionCalculator.getPosition(me, Infinity, i, popularSubTaxa.length, parentPosition);
                        //position has added movement to handle rotation (left moved so center is where rotation happens, top so that it corrects for the rotation)
                        popSubtaxonBox.setLeft(pos[0] - (taxonBox.getWidth(false) - taxonBox.getHeight(false)) / 2);
                        popSubtaxonBox.setTop(pos[1] + (taxonBox.getWidth(false) - taxonBox.getHeight(false))  / 2);
                        popSubtaxonBox.setStyle(
                            '-webkit-transform: rotate(-90deg);'+ //safari and chrome
                            ' -moz-transform: rotate(-90deg);'+ //firefox
                            ' transform: rotate(-90deg);'+ //ie10
                            ' -o-transform: rotate(-90deg);' //opera
                        );
                        me.add(popSubtaxonBox);
                        me.add({
                            xtype: 'elbowconnector',
                            startX: parentPosition[0] + taxonBox.getWidth(false) / 2,
                            endX: pos[0] + taxonBox.getHeight(false) / 2,
                            startY: pos[1] - 40,
                            endY: pos[1],
                            lineStyle: 'dashed',
                            lineWidth: 1
                        });
                    }
                }
            }
        });
    }
});
