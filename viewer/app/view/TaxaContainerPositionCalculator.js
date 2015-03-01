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

Ext.define('BioLadderOrg.view.TaxaContainerPositionCalculator', {
    requires: [
        'BioLadderOrg.view.TaxonBox.TaxonBox'
    ],

    statics:{
        topSpacing: 10,
        horizontalSpacing: 10,
        verticalSpacing: 20,
        
        /**
         * taxonDescendantIndex - 0 for the current taxon, -1 for the parent, 1 for the child, Infinity for the popular descendants
         * taxonSiblingIndex - if current taxon shows siblings, - for left, + for right. Otherwise 0 to number of siblings.
         * parentTaxon - the parent taxon (used to position children relative to their parents. 
         * taxaContainer - used to get the properties (eg. width, height) of the taxa container
         * Returns a pair (x, y) of the coordinates.
         */
        getPosition: function(taxaContainer, taxonDescendantIndex, taxonSiblingIndex, siblingsCount, parentPosition){
            var x,y,
                taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;

            if(taxonDescendantIndex == -Infinity){
                var totalSiblingWidth  = siblingsCount * taxonBoxClass.getWidth(false) + (siblingsCount - 1) * this.horizontalSpacing;
                x = (taxaContainer.element.getWidth() - totalSiblingWidth) / 2 + taxonSiblingIndex * (taxonBoxClass.getWidth(false) + this.horizontalSpacing);
                y = this.topSpacing;
                return [x, y];
            }
            if(taxonDescendantIndex == -1){
                x = taxaContainer.element.getWidth() / 2 - taxonBoxClass.getWidth(false) / 2;
                y = this.topSpacing + taxonBoxClass.getHeight(false) + this.verticalSpacing;
                return [x, y];
            }
            if(taxonDescendantIndex == 0){
                x = taxaContainer.element.getWidth() / 2 - taxonBoxClass.getWidth(true) / 2;
                y = this.topSpacing + 2*(taxonBoxClass.getHeight(false) + this.verticalSpacing);
                return [x, y];
            }
            if(taxonDescendantIndex == 1){
                var totalSiblingWidth  = siblingsCount * taxonBoxClass.getWidth(false) + (siblingsCount - 1) * this.horizontalSpacing;
                x = (taxaContainer.element.getWidth() - totalSiblingWidth) / 2 + taxonSiblingIndex * (taxonBoxClass.getWidth(false) + this.horizontalSpacing);
                y = this.topSpacing + 2*(taxonBoxClass.getHeight(false) + this.verticalSpacing) + taxonBoxClass.getHeight(true) + this.verticalSpacing * 2;
                return [x, y];
            }
            if(taxonDescendantIndex == Infinity){
                var totalSiblingWidth  = siblingsCount * taxonBoxClass.getHeight(false) + (siblingsCount - 1) * this.horizontalSpacing * 2;
                x = parentPosition[0] + (taxonBoxClass.getWidth(false) - totalSiblingWidth) / 2 + taxonSiblingIndex * (taxonBoxClass.getHeight(false) + this.horizontalSpacing * 2);
                y = parentPosition[1] + taxonBoxClass.getHeight(false) + 2 * this.verticalSpacing;
                return [x, y];
            }
        },
        
        getIsCollapsedFromDisplayInfo: function(taxaContainer, taxonBoxDisplayInfo){
            if(taxonBoxDisplayInfo.descendantIndex == 0){
                return false;
            }else{
                return true;
            }
        },
        
        getRotationFromDisplayInfo: function(taxaContainer, taxonBoxDisplayInfo){
            if(taxonBoxDisplayInfo.descendantIndex == Infinity){
                return -90;
            }else{
                return 0;
            }
        },
        
        getPositionFromDisplayInfo: function(taxaContainer, taxonBoxDisplayInfo){
            var parentPos = null;
            if(taxonBoxDisplayInfo.descendantIndex == Infinity){ //if we need parent position
                parentPos = this.getPositionFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo.parentTaxonDisplayInfo);
            }
            return this.getPosition(taxaContainer, taxonBoxDisplayInfo.descendantIndex, taxonBoxDisplayInfo.taxonSiblingIndex, taxonBoxDisplayInfo.siblingsCount, parentPos);
        },
        
        getTopElbowConnectorPosFromDisplayInfo: function(taxaContainer, taxonBoxDisplayInfo){
            var me = this;
            var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
            var boxPosition = me.getPositionFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            
            var elbowConnectorPos = null;
            if(me.getRotationFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo) == 0){
                elbowConnectorPos = [
                    boxPosition[0] + taxonBoxClass.getWidth(!me.getIsCollapsedFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo)) / 2,
                    boxPosition[1]
                ];
            }else{ //otherwise it should be rotated -90 degrees, swapping height/width
                var elbowConnectorPos = [
                    boxPosition[0] + taxonBoxClass.getHeight(!me.getIsCollapsedFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo)) / 2,
                    boxPosition[1]
                ];
            }
            return elbowConnectorPos;
        },
        
        getBottomElbowConnectorPosFromDisplayInfo: function(taxaContainer, taxonBoxDisplayInfo){
            var me = this;
            var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
            var boxPosition = me.getPositionFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            
            var elbowConnectorPos = null;
            if(me.getRotationFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo) == 0){
                elbowConnectorPos = [
                    boxPosition[0] + taxonBoxClass.getWidth(!me.getIsCollapsedFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo)) / 2,
                    boxPosition[1] + taxonBoxClass.getHeight(!me.getIsCollapsedFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo)) 
                ];
            }else{ //otherwise it should be rotated -90 degrees, swapping height/width
                var elbowConnectorPos = [
                    boxPosition[0] + taxonBoxClass.getHeight(!me.getIsCollapsedFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo)) / 2,
                    boxPosition[1] + taxonBoxClass.getWidth(!me.getIsCollapsedFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo)) 
                ];
            }
            return elbowConnectorPos;
        },

        getElbowConnecterStyleFromDisplayInfo: function(taxaContainer, taxonBoxDisplayInfo){
            if(taxonBoxDisplayInfo.descendantIndex == Infinity || taxonBoxDisplayInfo.descendantIndex == -Infinity){
                return 'dashed';
            }else{
                return 'solid';
            }
        },
        
        getElbowConnecterLineWidthFromDisplayInfo: function(taxaContainer, taxonBoxDisplayInfo){
            if(taxonBoxDisplayInfo.descendantIndex == Infinity || taxonBoxDisplayInfo.descendantIndex == -Infinity){
                return 1;
            }else{
                return 2;
            }
        },
        
        getTaxonPositionConfigs: function(taxaContainer, taxonBoxDisplayInfo){
            var me = this;
            var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
            
            var taxonPositionConfigs = {};
            
            //taxon box position
            taxonPositionConfigs.taxonBoxPos = me.getPositionFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            taxonPositionConfigs.taxonBoxRotation = me.getRotationFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            taxonPositionConfigs.taxonBoxCollapsed = me.getIsCollapsedFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            if(taxonPositionConfigs.taxonBoxRotation == -90){
                taxonPositionConfigs.taxonBoxPos[0] = taxonPositionConfigs.taxonBoxPos[0] 
                                                      - (taxonBoxClass.getWidth(!taxonPositionConfigs.taxonBoxCollapsed) 
                                                         - taxonBoxClass.getHeight(!taxonPositionConfigs.taxonBoxCollapsed)) / 2;
                taxonPositionConfigs.taxonBoxPos[1] = taxonPositionConfigs.taxonBoxPos[1] 
                                                      + (taxonBoxClass.getWidth(!taxonPositionConfigs.taxonBoxCollapsed) 
                                                         - taxonBoxClass.getHeight(!taxonPositionConfigs.taxonBoxCollapsed))  / 2;
            }
            
            //connection points
            taxonPositionConfigs.bottomConnectPos = me.getBottomElbowConnectorPosFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            taxonPositionConfigs.topConnectPos = me.getTopElbowConnectorPosFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            taxonPositionConfigs.topConnectStyle = me.getElbowConnecterStyleFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            taxonPositionConfigs.topConnectLineWidth = me.getElbowConnecterLineWidthFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            
            return taxonPositionConfigs;
        },
        
        getAnimationDuration: function(){
            return 500;
        },
        
        getOffscreenStartPosition: function(taxaContainer, taxonBoxDisplayInfo, directionInfo){
            var me = this;
            var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
            var taxonBoxAdd = taxonBoxDisplayInfo.taxonBox;

            var offScreenPos = [];
            if(directionInfo.direction == 1 && taxonBoxDisplayInfo.descendantIndex == 1){
                //figure out whether to go left or right
                if(taxonBoxDisplayInfo.taxonSiblingIndex < directionInfo.minDescendant1SibblingIndex){
                    offScreenPos[0] =  -30 - taxonBoxClass.getWidth(false);;
                    offScreenPos[1] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[1];
                } else if(taxonBoxDisplayInfo.taxonSiblingIndex > directionInfo.maxDescendant1SibblingIndex){
                    offScreenPos[0] =  taxaContainer.element.getWidth() + 30 + taxonBoxClass.getWidth(false);;
                    offScreenPos[1] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[1];
                } else {
                    offScreenPos[0] =  -30 - taxonBoxClass.getWidth(false);
                    offScreenPos[1] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[1];
                }
            } else if(directionInfo.direction == 1 && taxonBoxDisplayInfo.descendantIndex == Infinity){
                if(taxonBoxDisplayInfo.parentTaxonDisplayInfo){
                    if(taxonBoxDisplayInfo.parentTaxonDisplayInfo.taxonSiblingIndex < directionInfo.minDescendant1SibblingIndex){
                        offScreenPos[0] =  -30 - taxonBoxClass.getWidth(false);;
                        offScreenPos[1] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[1];
                    } else if(taxonBoxDisplayInfo.parentTaxonDisplayInfo.taxonSiblingIndex > directionInfo.maxDescendant1SibblingIndex){
                        offScreenPos[0] =  taxaContainer.element.getWidth() + 30 + taxonBoxClass.getWidth(false);;
                        offScreenPos[1] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[1];
                    } else {
                        offScreenPos[0] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[0];
                        offScreenPos[1] = -30 - me.getHeightAccountingForRotation(taxonBoxDisplayInfo.taxonPositionConfigs);
                    }
                } else {
                    offScreenPos[0] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[0];
                    offScreenPos[1] = -30 - me.getHeightAccountingForRotation(taxonBoxDisplayInfo.taxonPositionConfigs);
                }
            } else if(directionInfo.direction > 0){
                offScreenPos[0] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[0];
                offScreenPos[1] = -30 - me.getHeightAccountingForRotation(taxonBoxDisplayInfo.taxonPositionConfigs);
            } else {
                offScreenPos[0] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[0];
                offScreenPos[1] = taxaContainer.element.getHeight() + me.getHeightAccountingForRotation(taxonBoxDisplayInfo.taxonPositionConfigs) / 2;
            }
            return offScreenPos;
        },
        
        getOffscreenEndPosition: function(taxaContainer, taxonBoxDisplayInfo, directionInfo){
            var me = this;
            var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
            var taxonBoxToRemove = taxonBoxDisplayInfo.taxonBox;
            
            var offScreenPos = [];
            if(directionInfo.direction == -1 && taxonBoxDisplayInfo.descendantIndex == 1){
                //figure out whether to go left or right
                if(taxonBoxDisplayInfo.taxonSiblingIndex < directionInfo.minDescendant1SibblingIndex){
                    offScreenPos[0] =  -30 - taxonBoxClass.getWidth(false);;
                    offScreenPos[1] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[1];
                } else if(taxonBoxDisplayInfo.taxonSiblingIndex > directionInfo.maxDescendant1SibblingIndex){
                    offScreenPos[0] =  taxaContainer.element.getWidth() + 30 + taxonBoxClass.getWidth(false);;
                    offScreenPos[1] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[1];
                } else {
                    offScreenPos[0] =  -30 - taxonBoxClass.getWidth(false);
                    offScreenPos[1] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[1];
                }
            } else if(directionInfo.direction == -1 && taxonBoxDisplayInfo.descendantIndex == Infinity){
                if(taxonBoxDisplayInfo.parentTaxonDisplayInfo){
                    if(taxonBoxDisplayInfo.parentTaxonDisplayInfo.taxonSiblingIndex < directionInfo.minDescendant1SibblingIndex){
                        offScreenPos[0] =  -30 - taxonBoxClass.getWidth(false);;
                        offScreenPos[1] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[1];
                    } else if(taxonBoxDisplayInfo.parentTaxonDisplayInfo.taxonSiblingIndex > directionInfo.maxDescendant1SibblingIndex){
                        offScreenPos[0] =  taxaContainer.element.getWidth() + 30 + taxonBoxClass.getWidth(false);;
                        offScreenPos[1] = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxPos[1];
                    } else {
                        offScreenPos[0] = taxonBoxToRemove.getLeft();
                        offScreenPos[1] = taxaContainer.element.getHeight() + me.getHeightAccountingForRotation(taxonBoxDisplayInfo.taxonPositionConfigs) / 2;
                    }
                } else {
                    offScreenPos[0] = taxonBoxToRemove.getLeft();
                    offScreenPos[1] = taxaContainer.element.getHeight() + me.getHeightAccountingForRotation(taxonBoxDisplayInfo.taxonPositionConfigs) / 2;
                }
            } else if(directionInfo.direction > 0){
                offScreenPos[0] = taxonBoxToRemove.getLeft();
                offScreenPos[1] = taxaContainer.element.getHeight() + me.getHeightAccountingForRotation(taxonBoxDisplayInfo.taxonPositionConfigs) / 2;
            } else {
                offScreenPos[0] = taxonBoxToRemove.getLeft();
                offScreenPos[1] = -30 - me.getHeightAccountingForRotation(taxonBoxDisplayInfo.taxonPositionConfigs);
            }
            return offScreenPos;
        },

        getHeightAccountingForRotation: function(taxonPositionConfigs){
            var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
            
            if(taxonPositionConfigs.taxonBoxRotation == 0){
                return taxonBoxClass.getHeight(taxonPositionConfigs.taxonBoxCollapsed);
            }else{ //it is rotated
                return taxonBoxClass.getWidth(taxonPositionConfigs.taxonBoxCollapsed);
            }
        },
        
        getDirectionInfo: function(olddisplayedTaxonBoxInfo, newdisplayedTaxonBoxInfo){
            var direction = null;
            var directionLevelsInfo = { from: {}, to: {}};
            var minDescendant1SibblingIndex = null;
            var maxDescendant1SibblingIndex = null;
            //I need something for each level, which sibling index is kept, or which position the current taxon is going to
            if(olddisplayedTaxonBoxInfo){
                for(var i = 0; i < newdisplayedTaxonBoxInfo.length; i++){
                    var newBoxItem = newdisplayedTaxonBoxInfo[i];
                    for(var j = 0; j < olddisplayedTaxonBoxInfo.length; j++){
                        oldBoxItem = olddisplayedTaxonBoxInfo[j];
                        if(newBoxItem.taxonBox == oldBoxItem.taxonBox){
                            if(!isNaN(newBoxItem.descendantIndex - oldBoxItem.descendantIndex)){
                                direction = newBoxItem.descendantIndex - oldBoxItem.descendantIndex;
                            }
                            if(!directionLevelsInfo.to[newBoxItem.descendantIndex]){
                                directionLevelsInfo.to[newBoxItem.descendantIndex] = []
                            }
                            if(!directionLevelsInfo.from[oldBoxItem.descendantIndex]){
                                directionLevelsInfo.from[oldBoxItem.descendantIndex] = []
                            }
                            directionLevelsInfo.to[newBoxItem.descendantIndex].push({from: oldBoxItem, to: newBoxItem});
                            directionLevelsInfo.from[oldBoxItem.descendantIndex].push({from: oldBoxItem, to: newBoxItem});
                            break;
                        }
                    }
                }
            }
            
            if(direction < 0){
                if(directionLevelsInfo.to[0]){
                    var levelto0 = directionLevelsInfo.to[0];
                    for(var i = 0; i < levelto0.length; i++){
                        if(minDescendant1SibblingIndex == null || levelto0[i].from.taxonSiblingIndex < minDescendant1SibblingIndex){
                            minDescendant1SibblingIndex = levelto0[i].from.taxonSiblingIndex;
                        }
                        if(maxDescendant1SibblingIndex == null || levelto0[i].from.taxonSiblingIndex > maxDescendant1SibblingIndex){
                            maxDescendant1SibblingIndex = levelto0[i].from.taxonSiblingIndex;
                        }
                    }
                }
            
            }else if(direction > 0){
                if(directionLevelsInfo.to[1]){
                    var level1 = directionLevelsInfo.to[1];
                    for(var i = 0; i < level1.length; i++){
                        if(minDescendant1SibblingIndex == null || level1[i].to.taxonSiblingIndex < minDescendant1SibblingIndex){
                            minDescendant1SibblingIndex = level1[i].to.taxonSiblingIndex;
                        }
                        if(maxDescendant1SibblingIndex == null || level1[i].to.taxonSiblingIndex > maxDescendant1SibblingIndex){
                            maxDescendant1SibblingIndex = level1[i].to.taxonSiblingIndex;
                        }
                    }
                }
            
            }
        
            return {direction: direction, minDescendant1SibblingIndex: minDescendant1SibblingIndex, maxDescendant1SibblingIndex: maxDescendant1SibblingIndex};
        },
        
        getOffscreenStartPositionConfigs: function(taxaContainer, taxonBoxDisplayInfo, directionInfo){
            var me = this;
            var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
            
            var taxonPositionConfigs = {};
            
            //taxon box position
            taxonPositionConfigs.taxonBoxPos = me.getOffscreenStartPosition(taxaContainer, taxonBoxDisplayInfo, directionInfo);
            taxonPositionConfigs.taxonBoxRotation = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxRotation;
            taxonPositionConfigs.taxonBoxCollapsed = true;
            
            //connection points
            taxonPositionConfigs.bottomConnectPos = me.getBottomElbowConnectorPos(taxonPositionConfigs.taxonBoxPos, taxonPositionConfigs.taxonBoxRotation, taxonPositionConfigs.taxonBoxCollapsed);
            taxonPositionConfigs.topConnectPos = me.getTopElbowConnectorPos(taxonPositionConfigs.taxonBoxPos, taxonPositionConfigs.taxonBoxRotation, taxonPositionConfigs.taxonBoxCollapsed);
            taxonPositionConfigs.topConnectStyle = me.getElbowConnecterStyleFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            taxonPositionConfigs.topConnectLineWidth = me.getElbowConnecterLineWidthFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            
            return taxonPositionConfigs;
        },
        
        getOffscreenEndPositionConfigs: function(taxaContainer, taxonBoxDisplayInfo, directionInfo){
            var me = this;
            var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
            
            var taxonPositionConfigs = {};
            
            //taxon box position
            taxonPositionConfigs.taxonBoxPos = me.getOffscreenEndPosition(taxaContainer, taxonBoxDisplayInfo, directionInfo);
            taxonPositionConfigs.taxonBoxRotation = taxonBoxDisplayInfo.taxonPositionConfigs.taxonBoxRotation;
            taxonPositionConfigs.taxonBoxCollapsed = true;
            
            //connection points
            taxonPositionConfigs.bottomConnectPos = me.getBottomElbowConnectorPos(taxonPositionConfigs.taxonBoxPos, taxonPositionConfigs.taxonBoxRotation, taxonPositionConfigs.taxonBoxCollapsed);
            taxonPositionConfigs.topConnectPos = me.getTopElbowConnectorPos(taxonPositionConfigs.taxonBoxPos, taxonPositionConfigs.taxonBoxRotation, taxonPositionConfigs.taxonBoxCollapsed);
            taxonPositionConfigs.topConnectStyle = me.getElbowConnecterStyleFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            taxonPositionConfigs.topConnectLineWidth = me.getElbowConnecterLineWidthFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo);
            
            return taxonPositionConfigs;
        },
        
        getTopElbowConnectorPos: function(taxonBoxPos, taxonBoxRotation, taxonBoxCollapsed){
            var me = this;
            var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
            
            var elbowConnectorPos = null;
            if(taxonBoxRotation == 0){
                elbowConnectorPos = [
                    taxonBoxPos[0] + taxonBoxClass.getWidth(!taxonBoxCollapsed) / 2,
                    taxonBoxPos[1]
                ];
            }else{ //otherwise it should be rotated -90 degrees, swapping height/width
                var elbowConnectorPos = [
                    taxonBoxPos[0] + taxonBoxClass.getHeight(!taxonBoxCollapsed) / 2,
                    taxonBoxPos[1]
                ];
            }
            return elbowConnectorPos;
        },
        
        getBottomElbowConnectorPos: function(taxonBoxPos, taxonBoxRotation, taxonBoxCollapsed){
            var me = this;
            var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
            
            var elbowConnectorPos = null;
            if(taxonBoxRotation == 0){
                elbowConnectorPos = [
                    taxonBoxPos[0] + taxonBoxClass.getWidth(!taxonBoxCollapsed) / 2,
                    taxonBoxPos[1] + taxonBoxClass.getHeight(!taxonBoxCollapsed) 
                ];
            }else{ //otherwise it should be rotated -90 degrees, swapping height/width
                var elbowConnectorPos = [
                    taxonBoxPos[0] + taxonBoxClass.getHeight(!taxonBoxCollapsed) / 2,
                    taxonBoxPos[1] + taxonBoxClass.getWidth(!taxonBoxCollapsed) 
                ];
            }
            return elbowConnectorPos;
        },
        
        getTaxonBoxMotionAttributeType: function(){
            if(Ext.browser.is.IE) {
                return 'top-left';
            }else{
                return 'transform';
            }
        },
        
        getCssTransitionAttribute: function(){
            if(Ext.browser.is.Chrome || Ext.browser.is.Safari) {
                return "-webkit-transform";
            }
            if(Ext.browser.is.Firefox) {
                return "-moz-transform";
            }
            if(Ext.browser.is.IE) {
                return "msTransform";
            }
            return "transform";
        },
        
        getCssTransitionAttributeAccessor: function(){
            if(Ext.browser.is.Chrome || Ext.browser.is.Safari) {
                return "webkitTransform";
            }
            if(Ext.browser.is.Firefox) {
                return "MozTransform";
            }
            if(Ext.browser.is.IE) {
                return "transform";
            }
            return "transform";
        }
    }
});
