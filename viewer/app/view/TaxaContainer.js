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
        //this.__TaxonBoxes = [];
        this.__displayedTaxonBoxInfo = [];
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
        var taxonDisplayInfo = { taxonBox: currentTaxonBox, descendantIndex: 0 };
        me.__displayedTaxonBoxInfo.push(taxonDisplayInfo);
       
        var taxonPos = posCalc.getPosition(me, 0, 0);
        /*if(currentTaxonBox){
            me.animateTaxonBoxTo(currentTaxonBox, taxonPos, false);
        } else{
            currentTaxonBox = me.createTaxonBox(taxon);
            currentTaxonBox.setCollapsed(false);
            currentTaxonBox.setLeft(taxonPos[0]);
            currentTaxonBox.setTop(taxonPos[1]);
            me.add(currentTaxonBox);
        }*/
 

        //display parentTaxon
        var parentLoadingSpinner = me.add({
            xtype: 'loadingspinner',
            centerY: taxonPos[1] - 30,
            centerX: taxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(true) / 2 
        });
        taxon.whenLoaded(function (loadedTaxon) {
            if (taxon === me.getTaxon()) {
                parentLoadingSpinner.destroy();
                me.addParentTaxon(taxon);
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
        
        if(me.__olddisplayedTaxonBoxInfo){
            me.animateTaxonBoxes();
        }
        
        for(i = 0; i < me.__olddisplayedTaxonBoxInfo.length; i++){
            me.remove(me.__olddisplayedTaxonBoxInfo[i].taxonBox, true);
        }
        me.__olddisplayedTaxonBoxInfo = null;
    },
    
    addParentTaxon: function(taxon){
        var parentTaxon = taxon.get('parentTaxon'),
            parentTaxonBox,
            parentTaxonPos,
            me = this,
            posCalc = BioLadderOrg.view.TaxaContainerPositionCalculator;

        if (parentTaxon) {
            parentTaxon.ensureFullyLoaded();
            parentTaxonPos = posCalc.getPosition(me, -1, 0);
            
            parentTaxonBox = me.findOrCreateTaxonBox(parentTaxon);

            me.__displayedTaxonBoxInfo.push({ taxonBox: parentTaxonBox, descendantIndex: -1 });
            if(!me.__olddisplayedTaxonBoxInfo){
                //me.add(parentTaxonBox);
                parentTaxonBox.setCollapsed(true);
                parentTaxonBox.setLeft(parentTaxonPos[0]);
                parentTaxonBox.setTop(parentTaxonPos[1]);
            }
            
            
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
                
                if(!me.__olddisplayedTaxonBoxInfo){
                    //me.add(descendantTaxonBox);
                    descendantTaxonBox.setCollapsed(true);
                    descendantTaxonBox.setLeft(subTaxaPos[0]);
                    descendantTaxonBox.setTop(subTaxaPos[1]);
                }
                me.add({
                    xtype: 'elbowconnector',
                    startX: taxonPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(true) / 2,
                    endX: subTaxaPos[0] + BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(false) / 2,
                    startY: subTaxaPos[1] - 40,
                    endY: subTaxaPos[1]
                });
                
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

                        var pos = BioLadderOrg.view.TaxaContainerPositionCalculator.getPosition(me, Infinity, i, popularSubTaxa.length, parentPosition);
                        //position has added movement to handle rotation (left moved so center is where rotation happens, top so that it corrects for the rotation)
                        if(!me.__olddisplayedTaxonBoxInfo){
                            popSubtaxonBox.setCollapsed(true);
                            popSubtaxonBox.setLeft(pos[0] - (taxonBox.getWidth(false) - taxonBox.getHeight(false)) / 2);
                            popSubtaxonBox.setTop(pos[1] + (taxonBox.getWidth(false) - taxonBox.getHeight(false))  / 2);
                            popSubtaxonBox.setStyle(
                                '-webkit-transform: rotate(-90deg);'+ //safari and chrome
                                ' -moz-transform: rotate(-90deg);'+ //firefox
                                ' transform: rotate(-90deg);'+ //ie10
                                ' -o-transform: rotate(-90deg);' //opera
                            );
                            //me.add(popSubtaxonBox);
                        }
                        var popSubtaxonDisplayInfo = { taxonBox: popSubtaxonBox, descendantIndex: Infinity, taxonSiblingIndex: i, siblingsCount: popularSubTaxa.length, parentTaxonDisplayInfo: subTaxonDisplayInfo };
                        me.__displayedTaxonBoxInfo.push(popSubtaxonDisplayInfo);
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
        
        
        //determine "direction"
        var direction = null;
        if(me.__olddisplayedTaxonBoxInfo){
            for(var i = 0; i < newdisplayedTaxonBoxInfo.length; i++){
                var newBoxItem = newdisplayedTaxonBoxInfo[i];
                for(var j = 0; j < me.__olddisplayedTaxonBoxInfo.length; j++){
                    oldBoxItem = me.__olddisplayedTaxonBoxInfo[j];
                    if(newBoxItem.taxonBox == oldBoxItem.taxonBox){
                        direction = newBoxItem.descendantIndex - oldBoxItem.descendantIndex;
                        break;
                    }
                }
                if(direction != null){
                    break;
                }
            }
        }
        
        /*var taxonPos = posCalc.getPosition(me, 0, 0);
        if(currentTaxonBox){
            me.animateTaxonBoxTo(currentTaxonBox, taxonPos, false);
        } else{
            currentTaxonBox = me.createTaxonBox(taxon);
            currentTaxonBox.setCollapsed(false);
            currentTaxonBox.setLeft(taxonPos[0]);
            currentTaxonBox.setTop(taxonPos[1]);
            me.add(currentTaxonBox);
        }*/
        
        //animate
        //for each in __displayedTaxonBoxInfo
          //find and delete from me.__olddisplayedTaxonBoxInfo
            //if found, animate between two positions
            //else create off screen and move in according to 
        for(var i = 0; i < newdisplayedTaxonBoxInfo.length; i++){
            var newBoxItem = newdisplayedTaxonBoxInfo[i];
            var taxonBox = newBoxItem.taxonBox;
            
            //parentTaxonDisplayInfo
            var taxonPos = posCalc.getPositionFromDisplayInfo(me, newBoxItem);
            var taxonCollapse = true;
            if(newBoxItem.descendantIndex == 0){
                taxonCollapse = false;
            }
            var taxonRotation = 0;
            if(newBoxItem.descendantIndex == Infinity){
                taxonRotation = -90;
            }
            
            var foundOldCopy = false;
            if(me.__olddisplayedTaxonBoxInfo){
                for(var j = 0; j < me.__olddisplayedTaxonBoxInfo.length; j++){
                    oldBoxItem = me.__olddisplayedTaxonBoxInfo[j];
                    if(oldBoxItem.taxonBox == taxonBox){
                        me.animateTaxonBoxTo(taxonBox, taxonPos, taxonCollapse, taxonRotation);
                        me.__olddisplayedTaxonBoxInfo.splice(j, 1);
                        foundOldCopy = true;
                        break;
                    }
                }
            }
            if(!foundOldCopy){
                //TODO: Create off screen and animate in
                taxonBox;
                taxonBox.setCollapsed(taxonCollapse);
                taxonBox.setLeft(taxonPos[0]);
                taxonBox.setTop(taxonPos[1]);
                
            }
        }
        
        //for remaining me.__olddisplayedTaxonBoxInfo, move off screen according to direction
        for(var i = 0; i < me.__olddisplayedTaxonBoxInfo.length; i++){
            //TODO: Animate off screen
            me.remove(me.__olddisplayedTaxonBoxInfo[i].taxonBox, true);
        }
    },
    
    animateTaxonBoxTo: function(taxonBox, pos, collapse, taxonRotation){
        var currentLeft = taxonBox.getLeft();
        var currentTop = taxonBox.getTop();
        
        if(taxonRotation == -90){ //make spatial corrections for a -90 degree rotation
            pos[0] = pos[0] - (taxonBox.getWidth(false) - taxonBox.getHeight(false)) / 2;
            pos[1] = pos[1] + (taxonBox.getWidth(false) - taxonBox.getHeight(false))  / 2;
        }
        
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
            duration: 500,
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
    }
});
