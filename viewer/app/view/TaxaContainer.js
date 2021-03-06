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
        'BioLadderOrg.view.LoadingSpinner',
        'BioLadderOrg.view.ParentCladePopup',
        'BioLadderOrg.view.ChildCladePopup'
    ],

    config: {
        control: {
            'taxonbox': {
                navigatetotaxon: 'onNavigateToTaxon'
            }
        },
        taxon: null,
        height: '100%',
        width: '100%',
        //scrollable: 'both' //dissabled until I can get the scrollable taxon box not to scroll this as well
    },

    initialize: function () {
        var me = this;
        me.firstLoad = true;
        me.__displayedTaxonBoxInfo = [];
        me.__deleteItem = function(item){
            me.remove(item, true);
        };
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
            
        me.__olddisplayedTaxonBoxInfo = me.__displayedTaxonBoxInfo;

        taxon = Ext.getStore('Taxa').findOrCreateTaxon(BioLadderOrg.model.Taxon.cleanTaxonName(name));

        me.setTaxon(taxon);
        //clear current display
        me.__olddisplayedTaxonBoxInfo = me.__displayedTaxonBoxInfo;
        me.__displayedTaxonBoxInfo = [];
        // fill in new displayTaxonBoxes with positions (by index, not absolute) and such.
        //after the initial set-up below, filling it what it can, call a new function with the two
        // new function goes through the two lists and figures out the "direction", then for each on the new list it 
        //animates it and pulls it out of the old list. It then goes through the remaining things in the old list and animates those disappearing.
        
        if(me.firstLoad){
            var cladeLegend = me.add({
                xtype: 'button', //button allows tap event capture
                baseCls: 'no-formatting',
                html: '<span style="font-size:10px">Parent Clade</span> <span id="parentCladesBtn" class="no-underline-link-btn" style="font-size:10px">[?]</span><br>&#8593;<br>&#8595;<br><span style="font-size:10px">Child Clade</span> <span id="childCladesBtn" class="no-underline-link-btn" style="font-size:10px">[?]</span>',
                top: 5,
                left: 5,
                listeners: {
                    tap: function(obj, e){
                        if(e.target.id == "childCladesBtn"){
                            Ext.Viewport.add(Ext.widget('childCladePopup'));
                        }
                        if(e.target.id == "parentCladesBtn"){
                            Ext.Viewport.add(Ext.widget('parentCladePopup'));
                        }
                    },
                }
             });
         }
        
        //display current taxon
        currentTaxonBox = me.findOrCreateTaxonBox(taxon);
        var taxonDisplayInfo = { taxonBox: currentTaxonBox, descendantIndex: 0 };
        me.__displayedTaxonBoxInfo.push(taxonDisplayInfo);
       
        var taxonPos = posCalc.getPosition(me, 0, 0);
        if(me.__olddisplayedTaxonBoxInfo.length == 0){  //if this is the first display
            var taxonPositionConfigs = posCalc.getTaxonPositionConfigs(me, taxonDisplayInfo);
            taxonDisplayInfo.taxonPositionConfigs = taxonPositionConfigs;
            
            currentTaxonBox.setCollapsed(false);
            currentTaxonBox.setLeft(taxonPos[0]);
            currentTaxonBox.setTop(taxonPos[1]);
        }
 

        //display parentTaxon
        me.destroyParentLoadingSpinner(taxonDisplayInfo);
        taxonDisplayInfo.parentLoadingSpinner = me.add({
            xtype: 'loadingspinner',
            centerY: taxonPos[1] - 30,
            centerX: taxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(true) / 2 
        });
        taxon.whenLoaded(function (loadedTaxon) {
            me.destroyParentLoadingSpinner(taxonDisplayInfo);
            if (taxon === me.getTaxon()) {
                me.addParentTaxon(taxon, taxonDisplayInfo);
            }
        });


        //display subTaxa
        me.destroyChildrenLoadingSpinner(taxonDisplayInfo);
        taxonDisplayInfo.childrenLoadingSpinner = me.add({
            xtype: 'loadingspinner',
            centerY: taxonPos[1] + BioLadderOrg.view.TaxonBox.TaxonBox.getHeight(true) + 40,
            centerX: taxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(true) / 2 ,
        });
        taxon.whenSubTaxaLoaded(function (loadedTaxon) {
            me.destroyChildrenLoadingSpinner(taxonDisplayInfo);
            if (taxon === me.getTaxon()) {
                me.addSubTaxa(taxon, taxonDisplayInfo, taxonPos);
            }
            
        });
        
        if(me.__olddisplayedTaxonBoxInfo.length != 0){
            me.animateTaxonBoxes();
        }

        me.firstLoad = false;
    },
    
    addParentTaxon: function(taxon, taxonDisplayInfo){
        var parentTaxon = taxon.get('parentTaxon'),
            parentTaxonBox,
            parentTaxonPos,
            me = this,
            posCalc = BioLadderOrg.view.TaxaContainerPositionCalculator;

        if (parentTaxon) {
            parentTaxon.ensureFullyLoaded();
            parentTaxonPos = posCalc.getPosition(me, -1, 0);
            
            parentTaxonBox = me.findOrCreateTaxonBox(parentTaxon);

            parentTaxonDisplayInfo = { taxonBox: parentTaxonBox, descendantIndex: -1 };
            me.__displayedTaxonBoxInfo.push(parentTaxonDisplayInfo);
            taxonDisplayInfo.parentTaxonDisplayInfo = parentTaxonDisplayInfo;
            
            //If we aren't currently transitioning to a new taxon
            if(me.__olddisplayedTaxonBoxInfo.length == 0){
                me.fadeInTaxonBox(parentTaxonDisplayInfo);
                me.fadeInParentElbowConnector(taxonDisplayInfo);
            }
            
            me.destroyParentLoadingSpinner(parentTaxonDisplayInfo);
            parentTaxonDisplayInfo.parentLoadingSpinner = me.add({
                xtype: 'loadingspinner',
                centerY: parentTaxonPos[1] - 6,
                centerX: parentTaxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(false) / 2,
                scale: .15
            });
            parentTaxon.whenLoaded(function (loadedTaxon) {
                me.destroyParentLoadingSpinner(parentTaxonDisplayInfo);
                if(taxon === me.getTaxon()){
                    //get up to 4 Popular Ancestors
                    popAncestors = [];

                    for(var i = 1; i <= 4; i++){
                        popAncestor = loadedTaxon.get('popularAncestor'+i);
                        if(popAncestor != null){
                            popAncestors.push(popAncestor);
                        }
                    }
                    
                    var prevTaxonDisplayInfo = parentTaxonDisplayInfo;
                    for(var i = 0; i < popAncestors.length; i++){
                        popAncestorTaxonBox = me.findOrCreateTaxonBox(popAncestors[i]);
                        
                        popAncestorTaxonDisplayInfo = { taxonBox: popAncestorTaxonBox, descendantIndex: -Infinity, taxonSiblingIndex: popAncestors.length - i - 1, siblingsCount: popAncestors.length}
                        me.__displayedTaxonBoxInfo.push(popAncestorTaxonDisplayInfo);
                        prevTaxonDisplayInfo.parentTaxonDisplayInfo = popAncestorTaxonDisplayInfo;
                        
                        //If we aren't currently transitioning to a new taxon
                        if(me.__olddisplayedTaxonBoxInfo.length == 0){
                            me.fadeInTaxonBox(popAncestorTaxonDisplayInfo);
                            me.fadeInParentElbowConnector(prevTaxonDisplayInfo);
                        }
                        prevTaxonDisplayInfo = popAncestorTaxonDisplayInfo;
                        popAncestors[i].ensureFullyLoaded();
                    }

                    var grandParentTaxon = loadedTaxon.get('parentTaxon');
                    if(grandParentTaxon){ 
                        grandParentTaxon.ensureFullyLoaded();
                    }
                }
            });
        }
    },
    
    addSubTaxa: function(taxon, taxonDisplayInfo, taxonPos){
        var i, descendantTaxonBox,
            me = this,
            posCalc = BioLadderOrg.view.TaxaContainerPositionCalculator;
        
        if (taxon.get('subTaxa').length > 0) {
            for (i = 0; i < taxon.get('subTaxa').length; i++) {
                
                taxon.get('subTaxa')[i].ensureFullyLoaded();
                descendantTaxonBox = me.findOrCreateTaxonBox(taxon.get('subTaxa')[i]);
                
                var subTaxonDisplayInfo = { taxonBox: descendantTaxonBox, descendantIndex: 1, taxonSiblingIndex: i, siblingsCount: taxon.get('subTaxa').length, parentTaxonDisplayInfo: taxonDisplayInfo};
                me.__displayedTaxonBoxInfo.push(subTaxonDisplayInfo);
                var subTaxaPos = posCalc.getPosition(me, 1, i, taxon.get('subTaxa').length);
                
                //if we are not currently transitioning to a new taxon
                if(me.__olddisplayedTaxonBoxInfo.length == 0){
                    me.fadeInTaxonBox(subTaxonDisplayInfo);
                    me.fadeInParentElbowConnector(subTaxonDisplayInfo);
                }
                
                //Display popular descendants when they are loaded
                me.addPopularDescendantsWhenLoaded(taxon, taxon.get('subTaxa')[i], subTaxonDisplayInfo, subTaxaPos);
                
                //Make sure one more level of descendants are loaded so popular descendants show up
                taxon.get('subTaxa')[i].whenSubTaxaLoaded(function (loadedDescTaxon) {
                    if(loadedDescTaxon.get('subTaxa')){
                        for(var j = 0; j < loadedDescTaxon.get('subTaxa').length; j++){
                            loadedDescTaxon.get('subTaxa')[j].ensureFullyLoaded();
                        }
                    }
                });
            }
        }
    },

    addPopularDescendantsWhenLoaded: function(pageTaxon, taxon, subTaxonDisplayInfo, parentPosition){
        var me = this,
            taxonBox = BioLadderOrg.view.TaxonBox.TaxonBox;
        
        me.destroyChildrenLoadingSpinner(subTaxonDisplayInfo);
        subTaxonDisplayInfo.childrenLoadingSpinner = me.add({
            xtype: 'loadingspinner',
            centerY: parentPosition[1] + BioLadderOrg.view.TaxonBox.TaxonBox.getHeight(false) + 40,
            centerX: parentPosition[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(false) / 2 ,
        });
        
        taxon.whenSubTaxaLoaded(function (loadedDescTaxon) {
            me.destroyChildrenLoadingSpinner(subTaxonDisplayInfo);
            if (pageTaxon === me.getTaxon()) {//check that correct taxon is still up
                if(loadedDescTaxon.get('popularSubTaxa') && loadedDescTaxon.get('popularSubTaxa').length > 0) {
                    var popularSubTaxa = loadedDescTaxon.get('popularSubTaxa');
                    for(var i = 0; i < popularSubTaxa.length; i++){
                        var popSubtaxonBox = me.findOrCreateTaxonBox(popularSubTaxa[i]);

                        var popSubtaxonDisplayInfo = { taxonBox: popSubtaxonBox, descendantIndex: Infinity, taxonSiblingIndex: i, siblingsCount: popularSubTaxa.length, parentTaxonDisplayInfo: subTaxonDisplayInfo };
                        me.__displayedTaxonBoxInfo.push(popSubtaxonDisplayInfo);
                        
                        //If we aren't currently moving to a new taxon
                        if(me.__olddisplayedTaxonBoxInfo.length == 0){
                            me.fadeInTaxonBox(popSubtaxonDisplayInfo);
                            me.fadeInParentElbowConnector(popSubtaxonDisplayInfo);
                        }
                    }
                }
            }
        });
    },

    findOrCreateTaxonBox: function (taxon) {
        var i, taxonbox, me = this;
        if(me.__olddisplayedTaxonBoxInfo){
            for (i = 0; i < me.__olddisplayedTaxonBoxInfo.length; i++) {
                if (me.__olddisplayedTaxonBoxInfo[i].taxonBox.getTaxon() === taxon) {
                    return me.__olddisplayedTaxonBoxInfo[i].taxonBox;
                }
            }
        }

        taxonbox = Ext.widget('taxonbox', {
            taxon: taxon
        });
        me.add(taxonbox);
        return taxonbox;
    },

    animateTaxonBoxes: function(){
        var me = this;
        var newdisplayedTaxonBoxInfo = me.__displayedTaxonBoxInfo;
        var posCalc = BioLadderOrg.view.TaxaContainerPositionCalculator;
        var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;

       var directionInfo =  posCalc.getDirectionInfo(me.__olddisplayedTaxonBoxInfo, newdisplayedTaxonBoxInfo);
       direction = directionInfo.direction;

        //animate each of the new Taxon Boxes
        for(var i = 0; i < newdisplayedTaxonBoxInfo.length; i++){
            var newBoxInfo = newdisplayedTaxonBoxInfo[i];
            var taxonBox = newBoxInfo.taxonBox;

            var taxonPositionConfigs = posCalc.getTaxonPositionConfigs(me, newBoxInfo);
            newBoxInfo.taxonPositionConfigs = taxonPositionConfigs;
            
            var oldDisplayInfo = null;
            //mark if this taxon box was in the old display
            if(me.__olddisplayedTaxonBoxInfo){
                for(var j = 0; j < me.__olddisplayedTaxonBoxInfo.length; j++){
                    oldBoxInfo = me.__olddisplayedTaxonBoxInfo[j];
                    if(oldBoxInfo.taxonBox == taxonBox){
                        oldDisplayInfo = oldBoxInfo;

                        me.__olddisplayedTaxonBoxInfo.splice(j, 1);
                        break;
                    }
                }
            }
            
            if(oldDisplayInfo){ //If this taxon box already was on screen, animate it
                newBoxInfo.oldTaxonPositionConfigs = oldDisplayInfo.taxonPositionConfigs;
                oldDisplayInfo.newTaxonPositionConfigs = newBoxInfo.taxonPositionConfigs;
                newBoxInfo.oldParentElbowConnector = oldDisplayInfo.parentElbowConnector;
                if(oldDisplayInfo.parentTaxonDisplayInfo){
                    newBoxInfo.oldParentConnectionTaxon = oldDisplayInfo.parentTaxonDisplayInfo.taxonBox.getTaxon();
                }
                
                taxonBox.animateTo(taxonPositionConfigs.taxonBoxPos, taxonPositionConfigs.taxonBoxCollapsed, taxonPositionConfigs.taxonBoxRotation, taxonPositionConfigs.taxonBoxScale);
            }else{ //animate in from off screen
                taxonBox.setCollapsed(true);
                var taxonBoxStyle = {}
                taxonBoxStyle[posCalc.getCssTransitionAttribute()] = 'rotate('+taxonPositionConfigs.taxonBoxRotation+'deg)';
                taxonBox.setStyle(taxonBoxStyle);
                
                if(direction == null || direction == 0 || isNaN(direction)){
                    newBoxInfo.oldTaxonPositionConfigs = newBoxInfo.taxonPositionConfigs;
                    taxonBox.setLeft(newBoxInfo.taxonPositionConfigs.taxonBoxPos[0]);
                    taxonBox.setTop(newBoxInfo.taxonPositionConfigs.taxonBoxPos[1]);
                    taxonBox.setCollapsed(taxonPositionConfigs.taxonBoxCollapsed);
                    taxonBox.fadeIn();
                } else {
                    var offScreenStartPosConf = posCalc.getOffscreenStartPositionConfigs(me, newBoxInfo, directionInfo);
                    newBoxInfo.offScreenStartPosConf = offScreenStartPosConf;
                    var offScreenPos = offScreenStartPosConf.taxonBoxPos
                    
                    taxonBox.setLeft(offScreenPos[0]);
                    taxonBox.setTop(offScreenPos[1]);
                    taxonBox.animateTo(taxonPositionConfigs.taxonBoxPos, taxonPositionConfigs.taxonBoxCollapsed, taxonPositionConfigs.taxonBoxRotation, taxonPositionConfigs.taxonBoxScale);
                }
            }
            
        }
        
        //for remaining me.__olddisplayedTaxonBoxInfo, move off screen according to direction
        for(var i = 0; i < me.__olddisplayedTaxonBoxInfo.length; i++){
            var oldTaxonBoxDispInfo = me.__olddisplayedTaxonBoxInfo[i];
            var taxonBoxToRemove = oldTaxonBoxDispInfo.taxonBox;
            
            if(direction == null || direction == 0 || isNaN(direction)){
                //TODO: Put this as the offscreenEndPosConfig, same location
                oldTaxonBoxDispInfo.offScreenEndPosConfig = oldTaxonBoxDispInfo.taxonPositionConfigs;
                taxonBoxToRemove.fadeOut(me.__deleteItem);
            } else {
                var offScreenEndPosConfig = posCalc.getOffscreenEndPositionConfigs(me, oldTaxonBoxDispInfo, directionInfo); 
                oldTaxonBoxDispInfo.offScreenEndPosConfig = offScreenEndPosConfig; 
                var offScreenPos = offScreenEndPosConfig.taxonBoxPos;
                newBoxInfo.deleteWhenDone = true;
                taxonBoxToRemove.animateTo(offScreenPos, offScreenEndPosConfig.taxonBoxCollapsed, offScreenEndPosConfig.taxonBoxRotation, taxonPositionConfigs.taxonBoxScale, me.__deleteItem);
            }
        }
        //then remove all their elbow connectors:
        for(var i = 0; i < me.__olddisplayedTaxonBoxInfo.length; i++){
            var oldTaxonBoxDispInfo = me.__olddisplayedTaxonBoxInfo[i];
            if(oldTaxonBoxDispInfo.parentElbowConnector){
                var newParentPositionConfigs = null;
                for(var j = 0; j < newdisplayedTaxonBoxInfo.length; j++){
                    if(parentTaxonDisplayInfo.taxonBox == newdisplayedTaxonBoxInfo[j].taxonBox){
                        newParentPositionConfigs = newdisplayedTaxonBoxInfo[j].taxonPositionConfigs;
                        break
                    }
                }
                for(var j = 0; j < me.__olddisplayedTaxonBoxInfo.length; j++){
                    if(parentTaxonDisplayInfo.taxonBox == me.__olddisplayedTaxonBoxInfo[j].taxonBox){
                        newParentPositionConfigs = me.__olddisplayedTaxonBoxInfo[j].offScreenEndPosConfig;
                        break
                    }
                }
                if(newParentPositionConfigs){
                    var topElbowConnectorPos = oldTaxonBoxDispInfo.offScreenEndPosConfig.topConnectPos;
                    var parentElbowConnectorPos = newParentPositionConfigs.bottomConnectPos;
                    var lineStyle = oldTaxonBoxDispInfo.offScreenEndPosConfig.topConnectStyle;
                    var lineWidth = oldTaxonBoxDispInfo.offScreenEndPosConfig.topConnectLineWidth;
                    oldTaxonBoxDispInfo.parentElbowConnector.animateTo(parentElbowConnectorPos, topElbowConnectorPos, lineStyle, lineWidth);
                }
                oldTaxonBoxDispInfo.parentElbowConnector.fadeOut(me.__deleteItem);
            }
        }
        
        
        //animate elbow connectors
        for(var i = 0; i < newdisplayedTaxonBoxInfo.length; i++){
            //we handle to the top connector of each one
            var newBoxInfo = newdisplayedTaxonBoxInfo[i];

             //handle the previous one
            if(newBoxInfo.oldParentElbowConnector){
                if(newBoxInfo.parentTaxonDisplayInfo 
                    && newBoxInfo.parentTaxonDisplayInfo.taxonBox.getTaxon() == newBoxInfo.oldParentConnectionTaxon){
                    //This elbow connector can just be moved to the new position, and we are done with this row
                    newBoxInfo.parentElbowConnector = newBoxInfo.oldParentElbowConnector;
                    var topElbowConnectorPos = newBoxInfo.taxonPositionConfigs.topConnectPos;
                    var parentElbowConnectorPos = newBoxInfo.parentTaxonDisplayInfo.taxonPositionConfigs.bottomConnectPos;
                    var lineStyle = newBoxInfo.taxonPositionConfigs.topConnectStyle;
                    var lineWidth = newBoxInfo.taxonPositionConfigs.topConnectLineWidth;
                    
                    newBoxInfo.parentElbowConnector.animateTo(parentElbowConnectorPos, topElbowConnectorPos, lineStyle, lineWidth);
                    continue;
                }else{
                    //This elbow connector must be gotten rid of
                    var newParentPositionConfigs = null;
                    for(var j = 0; j < newdisplayedTaxonBoxInfo.length; j++){
                        if(newBoxInfo.oldParentConnectionTaxon == newdisplayedTaxonBoxInfo[j].taxonBox.getTaxon()){
                            newParentPositionConfigs = newdisplayedTaxonBoxInfo[j].taxonPositionConfigs;
                            break
                        }
                    }
                    for(var j = 0; j < me.__olddisplayedTaxonBoxInfo.length; j++){
                        if(newBoxInfo.oldParentConnectionTaxon == me.__olddisplayedTaxonBoxInfo[j].taxonBox.getTaxon()){
                            newParentPositionConfigs = me.__olddisplayedTaxonBoxInfo[j].offScreenEndPosConfig;
                            break
                        }
                    }
                    if(newParentPositionConfigs){
                        var topElbowConnectorPos = newBoxInfo.taxonPositionConfigs.topConnectPos;
                        var parentElbowConnectorPos = newParentPositionConfigs.bottomConnectPos;
                        var lineStyle = newBoxInfo.taxonPositionConfigs.topConnectStyle;
                        var lineWidth = newBoxInfo.taxonPositionConfigs.topConnectLineWidth;
                        newBoxInfo.oldParentElbowConnector.animateTo(parentElbowConnectorPos, topElbowConnectorPos, lineStyle, lineWidth);
                    }
                    newBoxInfo.oldParentElbowConnector.fadeOut(me.__deleteItem);
                }
            }
            
            //Any matching elbow connectors have been handled, now we must add the remaining ones
            // if position is -1, then connect to the empty space above
            // else, connect to the actual parent
            if(!newBoxInfo.parentTaxonDisplayInfo){ // There is no new parent to connect to, go to the next one
                continue;
            }
            var startTopElbowConnectorPos = null;
            var startParentElbowConnectorPos = null;
            if(newBoxInfo.oldTaxonPositionConfigs){
                startTopElbowConnectorPos = newBoxInfo.oldTaxonPositionConfigs.topConnectPos;
            } else if(newBoxInfo.offScreenStartPosConf) {
                startTopElbowConnectorPos = newBoxInfo.offScreenStartPosConf.topConnectPos;
            }

            if(newBoxInfo.parentTaxonDisplayInfo.oldTaxonPositionConfigs){
                startParentElbowConnectorPos = newBoxInfo.parentTaxonDisplayInfo.oldTaxonPositionConfigs.bottomConnectPos;
            } else if(newBoxInfo.parentTaxonDisplayInfo.offScreenStartPosConf){
                startParentElbowConnectorPos = newBoxInfo.parentTaxonDisplayInfo.offScreenStartPosConf.bottomConnectPos;
            }

            newBoxInfo.parentElbowConnector = me.add({
                xtype: 'elbowconnector',
                startX: startParentElbowConnectorPos[0],
                endX: startTopElbowConnectorPos[0],
                startY: startParentElbowConnectorPos[1],
                endY: startTopElbowConnectorPos[1],
                lineStyle: newBoxInfo.taxonPositionConfigs.topConnectStyle,
                lineWidth: newBoxInfo.taxonPositionConfigs.topConnectLineWidth,
                bottomTaxonName: newBoxInfo.taxonBox.getTaxon().get('name'), // for debugging
                topTaxonName: newBoxInfo.parentTaxonDisplayInfo.taxonBox.getTaxon().get('name') // for debugging
            });
            var topElbowConnectorPos = newBoxInfo.taxonPositionConfigs.topConnectPos;
            var parentElbowConnectorPos = newBoxInfo.parentTaxonDisplayInfo.taxonPositionConfigs.bottomConnectPos;
            var lineStyle = newBoxInfo.taxonPositionConfigs.topConnectStyle;
            var lineWidth = newBoxInfo.taxonPositionConfigs.topConnectLineWidth;
            newBoxInfo.parentElbowConnector.animateTo(parentElbowConnectorPos, topElbowConnectorPos, lineStyle, lineWidth);
            Ext.Animator.run({
                element: newBoxInfo.parentElbowConnector.element,
                autoClear: false,
                duration: BioLadderOrg.view.TaxaContainerPositionCalculator.getAnimationDuration(),
                easing: 'ease-in-out',
                from: {
                    'opacity': -1
                },
                to: {
                    'opacity': 1,
                }
            });
            
        }
        
        me.__olddisplayedTaxonBoxInfo = [];
    },

    fadeInTaxonBox: function(taxonBoxDispInfo){
        var me = this;
        var taxonBox = taxonBoxDispInfo.taxonBox;
        var posCalc = BioLadderOrg.view.TaxaContainerPositionCalculator;
        var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
        
        var taxonPos = posCalc.getPositionFromDisplayInfo(me, taxonBoxDispInfo);
        
        var taxonPositionConfigs = posCalc.getTaxonPositionConfigs(me, taxonBoxDispInfo);
        taxonBoxDispInfo.taxonPositionConfigs = taxonPositionConfigs;

        taxonBox.setCollapsed(taxonPositionConfigs.taxonBoxCollapsed);
        taxonBox.setLeft(taxonPositionConfigs.taxonBoxPos[0]);
        taxonBox.setTop(taxonPositionConfigs.taxonBoxPos[1]);
        var taxonBoxStyle = {};
        taxonBoxStyle[posCalc.getCssTransitionAttribute()] = 'rotate('+taxonPositionConfigs.taxonBoxRotation+'deg)'+
            ' scale(' +taxonPositionConfigs.taxonBoxScale+')';
        taxonBox.setStyle(taxonBoxStyle);

        taxonBox.fadeIn();
    },

    fadeInParentElbowConnector: function(taxonBoxDispInfo){
        var me = this;
        var posCalc = BioLadderOrg.view.TaxaContainerPositionCalculator;
        
        if(taxonBoxDispInfo.descendantIndex == Infinity || taxonBoxDispInfo.descendantIndex == -Infinity 
           || taxonBoxDispInfo.taxonBox.getTaxon().get('parentTaxon')){
            var topElbowConnectorPos = taxonBoxDispInfo.taxonPositionConfigs.topConnectPos;
            var parentElbowConnectorPos = taxonBoxDispInfo.parentTaxonDisplayInfo.taxonPositionConfigs.bottomConnectPos

            taxonBoxDispInfo.parentElbowConnector = me.add({
                xtype: 'elbowconnector',
                startX: parentElbowConnectorPos[0],
                endX: topElbowConnectorPos[0],
                startY: parentElbowConnectorPos[1],
                endY: topElbowConnectorPos[1],
                lineStyle: taxonBoxDispInfo.taxonPositionConfigs.topConnectStyle,
                lineWidth: taxonBoxDispInfo.taxonPositionConfigs.topConnectLineWidth,
                bottomTaxonName: taxonBoxDispInfo.taxonBox.getTaxon().get('name'), // for debugging
                topTaxonName: taxonBoxDispInfo.parentTaxonDisplayInfo.taxonBox.getTaxon().get('name') // for debugging
            });
            
            taxonBoxDispInfo.parentElbowConnector.fadeIn();
        }
    },
    
    destroyParentLoadingSpinner: function(taxonDisplayInfo){
        if(taxonDisplayInfo.parentLoadingSpinner){
            taxonDisplayInfo.parentLoadingSpinner.destroy();
            taxonDisplayInfo.parentLoadingSpinner = null;
        }
    },
    
    destroyChildrenLoadingSpinner: function(taxonDisplayInfo){
        if(taxonDisplayInfo.childrenLoadingSpinner){
            taxonDisplayInfo.childrenLoadingSpinner.destroy();
            taxonDisplayInfo.childrenLoadingSpinner = null;
        }
    }
    
});
