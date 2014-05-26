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
        this.firstLoad = true;
        this.__displayedTaxonBoxInfo = []; //TODO, store Elbow connectors with this?
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

        taxon = Ext.getStore('Taxa').findOrCreateTaxon(name);

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
         }
        
        //display current taxon
        currentTaxonBox = me.findOrCreateTaxonBox(taxon);
        var taxonDisplayInfo = { taxonBox: currentTaxonBox, descendantIndex: 0 };
        me.__displayedTaxonBoxInfo.push(taxonDisplayInfo);
       
        var taxonPos = posCalc.getPosition(me, 0, 0);
        if(me.__olddisplayedTaxonBoxInfo.length == 0){
            me.animateTaxonBoxTo(currentTaxonBox, taxonPos, false);
            currentTaxonBox.setCollapsed(false);
            currentTaxonBox.setLeft(taxonPos[0]);
            currentTaxonBox.setTop(taxonPos[1]);
        }
 

        //display parentTaxon
        var parentLoadingSpinner = me.add({
            xtype: 'loadingspinner',
            centerY: taxonPos[1] - 30,
            centerX: taxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(true) / 2 
        });
        taxon.whenLoaded(function (loadedTaxon) {
            if (taxon === me.getTaxon()) {
                parentLoadingSpinner.destroy();
                me.addParentTaxon(taxon, taxonDisplayInfo);
            }
        });


        //display subTaxa
        var childrenLoadingSpinner = me.add({
            xtype: 'loadingspinner',
            centerY: taxonPos[1] + BioLadderOrg.view.TaxonBox.TaxonBox.getHeight(true) + 40,
            centerX: taxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(true) / 2 ,
        });
        taxon.whenSubTaxaLoaded(function (loadedTaxon) {
            if (taxon === me.getTaxon()) {
                childrenLoadingSpinner.destroy();
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
                    me.fadeInParentElbowConnector(parentTaxonDisplayInfo);
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
                    //clear rotation before returning
                    /*me.__TaxonBoxes[i].setStyle(
                        '-webkit-transform: rotate(0);'+ //safari and chrome
                        ' -moz-transform: rotate(0);'+ //firefox
                        ' transform: rotate(0);'+ //ie10
                        ' -o-transform: rotate(0);' //opera
                    );*/
                    return me.__olddisplayedTaxonBoxInfo[i].taxonBox;
                }
            }
        }

        taxonbox = Ext.widget('taxonbox', {
            taxon: taxon
        });
        me.add(taxonbox);
        //me.__TaxonBoxes.push(taxonbox);
        return taxonbox;
        /*var taxonBox = this.findAndRemoveTaxonBox(taxon, me.__olddisplayedTaxonBoxInfo);
        if(taxonBox){
            this.remove(taxonBox, true);
            //return taxonBox;
        }
        return this.createTaxonBox(taxon);
        */
    },
    
    findAndRemoveTaxonBox: function (taxon) {
        var i, taxonbox, me = this;
        
        var foundBox = null;
        for(i = 0; i < me.__olddisplayedTaxonBoxInfo.length; i++){
            if(me.__olddisplayedTaxonBoxInfo[i].taxonBox.getTaxon() == taxon){
                foundBox = me.__olddisplayedTaxonBoxInfo[i].taxonBox;
                /*foundBox.setStyle(
                    '-webkit-transform: rotate(0);'+ //safari and chrome
                    ' -moz-transform: rotate(0);'+ //firefox
                    ' transform: rotate(0);'+ //ie10
                    ' -o-transform: rotate(0);' //opera
                );*/
                me.__olddisplayedTaxonBoxInfo.splice(i, 1);
                break;
            }
        }
        
        return foundBox;
    },
    
    createTaxonBox: function(taxon) {
        var taxonbox = Ext.widget('taxonbox', {
            taxon: taxon
        });
        return taxonbox;
    },
    
    animateTaxonBoxes: function(){
        var me = this;
        var newdisplayedTaxonBoxInfo = me.__displayedTaxonBoxInfo;
        var posCalc = BioLadderOrg.view.TaxaContainerPositionCalculator;
        var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
        
        //create a struct of before/after (including off-screen animate in and off info)
            //use this to run the animations on the boxes and to animate/position the elbow connectors and loading thingies.
        //I really need to parent info, do I need the old info? I have it in this function when it's available.
        // How do I figure out the parent info? I do that earlier and have that here, handy
        //we have parentTaxonDisplayInfo now
        
       var directionInfo =  posCalc.getDirectionInfo(me.__olddisplayedTaxonBoxInfo, newdisplayedTaxonBoxInfo);
       direction = directionInfo.direction;
        
        //animate Taxon Boxes
        for(var i = 0; i < newdisplayedTaxonBoxInfo.length; i++){
            var newBoxInfo = newdisplayedTaxonBoxInfo[i];
            var taxonBox = newBoxInfo.taxonBox;
            
            //parentTaxonDisplayInfo
            var taxonPositionConfigs = posCalc.getTaxonPositionConfigs(me, newBoxInfo);
            //taxonBoxPos, taxonBoxRotation, taxonBoxCollapsed, taxonBoxRotation, bottomConnectPos, topConnectPos, topConnectStyle, topConnectLineWidth
            newBoxInfo.taxonPositionConfigs = taxonPositionConfigs;
            
            var oldDisplayInfo = null;
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
            
            if(oldDisplayInfo){
                newBoxInfo.oldTaxonPositionConfigs = oldDisplayInfo.taxonPositionConfigs;
                oldDisplayInfo.newTaxonPositionConfigs = newBoxInfo.taxonPositionConfigs;
                newBoxInfo.oldParentElbowConnector = oldDisplayInfo.parentElbowConnector;
                if(oldDisplayInfo.parentTaxonDisplayInfo){
                    newBoxInfo.oldParentConnectionTaxon = oldDisplayInfo.parentTaxonDisplayInfo.taxonBox.getTaxon();
                }
                
                me.animateTaxonBoxTo(taxonBox, taxonPositionConfigs.taxonBoxPos, taxonPositionConfigs.taxonBoxCollapsed, taxonPositionConfigs.taxonBoxRotation);
            }else{ //animate in from off screen
                taxonBox.setCollapsed(true);
                taxonBox.setStyle({
                    '-webkit-transform': 'rotate('+taxonPositionConfigs.taxonBoxRotation+'deg)'
                });
                
                if(direction == null || direction == 0 || isNaN(direction)){
                    newBoxInfo.oldTaxonPositionConfigs = newBoxInfo.taxonPositionConfigs;
                } else {
                    var offScreenStartPosConf = posCalc.getOffscreenStartPositionConfigs(me, newBoxInfo, directionInfo);
                    newBoxInfo.offScreenStartPosConf = offScreenStartPosConf;
                    var offScreenPos = offScreenStartPosConf.taxonBoxPos
                    
                    taxonBox.setLeft(offScreenPos[0]);
                    taxonBox.setTop(offScreenPos[1]);
                    me.animateTaxonBoxTo(taxonBox, taxonPositionConfigs.taxonBoxPos, taxonPositionConfigs.taxonBoxCollapsed, taxonPositionConfigs.taxonBoxRotation);
                }
            }
            
        }
        
        //for remaining me.__olddisplayedTaxonBoxInfo, move off screen according to direction
        for(var i = 0; i < me.__olddisplayedTaxonBoxInfo.length; i++){
            var oldTaxonBoxDispInfo = me.__olddisplayedTaxonBoxInfo[i];
            var taxonBoxToRemove = oldTaxonBoxDispInfo.taxonBox;
            
            if(direction == null || direction == 0 || isNaN(direction)){
                me.fadeOutTaxonBox(taxonBoxToRemove);
            } else {
                var offScreenEndPosConfig = posCalc.getOffscreenEndPositionConfigs(me, oldTaxonBoxDispInfo, directionInfo); 
                oldTaxonBoxDispInfo.offScreenEndPosConfig = offScreenEndPosConfig; 
                var offScreenPos = offScreenEndPosConfig.taxonBoxPos;
                newBoxInfo.deleteWhenDone = true;
                var callbackToDelte = function(taxonBoxToDelete){
                    me.remove(taxonBoxToDelete, true);
                }
                me.animateTaxonBoxTo(taxonBoxToRemove, offScreenPos, offScreenEndPosConfig.taxonBoxCollapsed, offScreenEndPosConfig.taxonBoxRotation, callbackToDelte);
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
                me.fadeOutParentElbowConnector(oldTaxonBoxDispInfo.parentElbowConnector);
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
                    me.fadeOutParentElbowConnector(newBoxInfo.oldParentElbowConnector);
                }
            }
            
            //Any matching elbow connectors have been handled, now we must add the remaining ones
            // if position is -1, then connect to the empty space above
            // else, connect to the actual parent
            var startTopElbowConnectorPos = null;
            var startParentElbowConnectorPos = null;
            if(newBoxInfo.oldTaxonPositionConfigs){
                startTopElbowConnectorPos = newBoxInfo.oldTaxonPositionConfigs.topConnectPos;
            } else if(newBoxInfo.offScreenStartPosConf) {
                startTopElbowConnectorPos = newBoxInfo.offScreenStartPosConf.topConnectPos;
            } else{
                continue;
            }
            if(!newBoxInfo.parentTaxonDisplayInfo){
                continue;
            }
            if(newBoxInfo.parentTaxonDisplayInfo.oldTaxonPositionConfigs){
                startParentElbowConnectorPos = newBoxInfo.parentTaxonDisplayInfo.oldTaxonPositionConfigs.bottomConnectPos;
            } else if(newBoxInfo.parentTaxonDisplayInfo.offScreenStartPosConf){
                startParentElbowConnectorPos = newBoxInfo.parentTaxonDisplayInfo.offScreenStartPosConf.bottomConnectPos;
            } else{
                continue;
            }

            newBoxInfo.parentElbowConnector = me.add({
                xtype: 'elbowconnector',
                startX: startParentElbowConnectorPos[0],
                endX: startTopElbowConnectorPos[0],
                startY: startParentElbowConnectorPos[1],
                endY: startTopElbowConnectorPos[1],
                lineStyle: posCalc.getElbowConnecterStyleFromDisplayInfo(me, newBoxInfo),
                lineWidth: posCalc.getElbowConnecterLineWidthFromDisplayInfo(me, newBoxInfo)
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
    
    animateTaxonBoxTo: function(taxonBox, pos, collapse, taxonRotation, callback){
        var currentLeft = taxonBox.getLeft();
        var currentTop = taxonBox.getTop();
        
        var beforeIsCollapsed = taxonBox.getCollapsed();
        
        var currentTransform = taxonBox.element.dom.style.webkitTransform;
        var rotateMatch = /rotate\(([-\d]*)deg\)/.exec(currentTransform);
        if(!rotateMatch){
            currentTransform += ' rotate(0deg) '
        }
        var translateMatch = /translate3d\(([\d px]*)\)/.exec(currentTransform);
        if(!translateMatch){
            currentTransform += ' translate3d(0 px, 0 px, 0) '
        }
        
        Ext.Animator.run({
            element: taxonBox.element,
            duration: BioLadderOrg.view.TaxaContainerPositionCalculator.getAnimationDuration(),
            easing: 'ease-in-out',
            from: {
                '-webkit-transform': currentTransform,
                'width': BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(!beforeIsCollapsed)                
            },
            to: {
                '-webkit-transform': 'translate3d(' + (pos[0] - currentLeft) + 'px, ' + (pos[1] - currentTop) + 'px, 0) ' +
                                     ' rotate('+taxonRotation+'deg) ',
                'width': BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(!collapse)
            },
            onEnd: function(arguments){
                //make sure the width gets reset properly by setting it the opposite first
                //taxonBox.setCollapsed(!collapse);
                taxonBox.setCollapsed(collapse);
                taxonBox.setLeft(pos[0]);
                taxonBox.setTop(pos[1]);
                taxonBox.setStyle({
                    '-webkit-transform': 'rotate('+taxonRotation+'deg)'
                });
                if(callback){
                    callback(taxonBox);
                }
            }
        });

        /*if(collapse && !beforeIsCollapsed){
            Ext.Animator.run({
                element: taxonBox.down('#taxonBoxContents').element,
                duration: 500,
                autoClear: false,
                easing: 'ease-in-out',
                from: {
                    'height': 255
                },
                to: {
                    'height': 0
                },
                onEnd: function(arguments){
                    taxonBox.setCollapsed(false);
                    taxonBox.setCollapsed(true);
                    //taxonBox.down('#taxonBoxContents').setHeight(255);
                }
            });
        }else if(!collapse && beforeIsCollapsed){
            taxonBox.setCollapsed(false);
            Ext.Animator.run({
                element: taxonBox.down('#taxonBoxContents').element,
                duration: 500,
                autoClear: false,
                easing: 'ease-in-out',
                from: {
                    'height': 0
                },
                to: {
                    'height': 255
                },
                onEnd: function(arguments){
                    taxonBox.setCollapsed(!collapse);
                    taxonBox.setCollapsed(collapse);
                    taxonBox.down('#taxonBoxContents').setHeight(255);
                }
            });
        }*/
    },
    
    fadeInTaxonBox: function(taxonBoxDispInfo){
        var me = this;
        var taxonBox = taxonBoxDispInfo.taxonBox;
        var posCalc = BioLadderOrg.view.TaxaContainerPositionCalculator;
        var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
        
        var taxonPos = posCalc.getPositionFromDisplayInfo(me, taxonBoxDispInfo);
        
        var taxonPositionConfigs = posCalc.getTaxonPositionConfigs(me, taxonBoxDispInfo);
        //taxonBoxPos, taxonBoxRotation, taxonBoxCollapsed, taxonBoxRotation, bottomConnectPos, topConnectPos, topConnectStyle, topConnectLineWidth
        taxonBoxDispInfo.taxonPositionConfigs = taxonPositionConfigs;
        
        taxonBox.setStyle(
            '-webkit-transform: rotate('+taxonPositionConfigs.taxonBoxRotation+'deg);'+ //safari and chrome
            ' -moz-transform: rotate('+taxonPositionConfigs.taxonBoxRotation+'deg);'+ //firefox
            ' transform: rotate('+taxonPositionConfigs.taxonBoxRotation+'deg);'+ //ie10
            ' -o-transform: rotate('+taxonPositionConfigs.taxonBoxRotation+'deg);' //opera
        );
        taxonBox.setCollapsed(taxonPositionConfigs.taxonBoxCollapsed);
        taxonBox.setLeft(taxonPositionConfigs.taxonBoxPos[0]);
        taxonBox.setTop(taxonPositionConfigs.taxonBoxPos[1]);

        
        Ext.Animator.run({
            element: taxonBox.element,
            autoClear: false,
            duration: BioLadderOrg.view.TaxaContainerPositionCalculator.getAnimationDuration(),
            easing: 'ease-in-out',
            from: {
                'opacity': 0
            },
            to: {
                'opacity': 1,
            }
        });
    },
    
    fadeOutTaxonBox: function(taxonBox){
        var me = this;
        
        if(taxonBox.element == null){
            console.log("cannot fade out taxon box: " + taxonBox.getTaxon().get('name') + ' since it has already been deleted');
            return;
        }
        Ext.Animator.run({
            element: taxonBox.element,
            autoClear: false,
            duration: BioLadderOrg.view.TaxaContainerPositionCalculator.getAnimationDuration() / 2,
            easing: 'linear',
            from: {
                'opacity': 1
            },
            to: {
                'opacity': 0,
            },
            onEnd: function(){
                me.remove(taxonBox, true);
            }
        });
    },
    
    fadeInParentElbowConnector: function(taxonBoxDispInfo){
        var me = this;
        var posCalc = BioLadderOrg.view.TaxaContainerPositionCalculator;
        
        if(taxonBoxDispInfo.descendantIndex == Infinity || taxonBoxDispInfo.taxonBox.getTaxon().get('parentTaxon')){
            var topElbowConnectorPos = posCalc.getTopElbowConnectorPosFromDisplayInfo(me, taxonBoxDispInfo);
            var parentElbowConnectorPos = posCalc.getParentElbowConnectorPosFromDisplayInfo(me, taxonBoxDispInfo);
            
            taxonBoxDispInfo.parentElbowConnector = me.add({
                xtype: 'elbowconnector',
                startX: parentElbowConnectorPos[0],
                endX: topElbowConnectorPos[0],
                startY: parentElbowConnectorPos[1],
                endY: topElbowConnectorPos[1],
                lineStyle: posCalc.getElbowConnecterStyleFromDisplayInfo(me, taxonBoxDispInfo),
                lineWidth: posCalc.getElbowConnecterLineWidthFromDisplayInfo(me, taxonBoxDispInfo)
            });
            Ext.Animator.run({
                element: taxonBoxDispInfo.parentElbowConnector.element,
                autoClear: false,
                duration: BioLadderOrg.view.TaxaContainerPositionCalculator.getAnimationDuration(),
                easing: 'ease-in-out',
                from: {
                    'opacity': 0
                },
                to: {
                    'opacity': 1,
                }
            });
        }
    },
    
    fadeOutParentElbowConnector: function(elbowConnector){
        var me = this;
        Ext.Animator.run({
            element: elbowConnector.element,
            autoClear: false,
            duration: BioLadderOrg.view.TaxaContainerPositionCalculator.getAnimationDuration() / 2,
            easing: 'linear',
            from: {
                'opacity': 1
            },
            to: {
                'opacity': 0,
            },
            onEnd: function(){
                me.remove(elbowConnector, true);
            }
        });
    }
});
