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
            if(taxonDescendantIndex == -1){
                x = taxaContainer.element.getWidth() / 2 - taxonBoxClass.getWidth(false) / 2;
                y = this.topSpacing;
                return [x, y];
            }
            if(taxonDescendantIndex == 0){
                x = taxaContainer.element.getWidth() / 2 - taxonBoxClass.getWidth(true) / 2;
                y = this.topSpacing + taxonBoxClass.getHeight(false) + this.verticalSpacing;
                return [x, y];
            }
            if(taxonDescendantIndex == 1){
                var totalSiblingWidth  = siblingsCount * taxonBoxClass.getWidth(false) + (siblingsCount - 1) * this.horizontalSpacing;
                x = (taxaContainer.element.getWidth() - totalSiblingWidth) / 2 + taxonSiblingIndex * (taxonBoxClass.getWidth(false) + this.horizontalSpacing);
                y = this.topSpacing + taxonBoxClass.getHeight(false) + this.verticalSpacing + taxonBoxClass.getHeight(true) + this.verticalSpacing * 2;
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
                return true;
            }else{
                return false;
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
                    boxPosition[0] + taxonBoxClass.getWidth(me.getIsCollapsedFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo)) / 2,
                    boxPosition[1]
                ];
            }else{ //otherwise it should be rotated -90 degrees, swapping height/width
                var elbowConnectorPos = [
                    boxPosition[0] + taxonBoxClass.getHeight(me.getIsCollapsedFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo)) / 2,
                    boxPosition[1]
                ];
            }
            return elbowConnectorPos;
        },
        
        getParentElbowConnectorPosFromDisplayInfo: function(taxaContainer, taxonBoxDisplayInfo){
            var me = this;
            var taxonBoxClass = BioLadderOrg.view.TaxonBox.TaxonBox;
            var parentDispInf = taxonBoxDisplayInfo.parentTaxonDisplayInfo;
            
            if(parentDispInf){
                var parentBoxPosition = me.getPositionFromDisplayInfo(taxaContainer, parentDispInf);
                return [
                    parentBoxPosition[0] + taxonBoxClass.getWidth(me.getIsCollapsedFromDisplayInfo(taxaContainer, parentDispInf)) / 2,
                    parentBoxPosition[1] + taxonBoxClass.getHeight(me.getIsCollapsedFromDisplayInfo(taxaContainer, parentDispInf)) 
                ];
            }else if(taxonBoxDisplayInfo.descendantIndex == -1){
                return [
                    taxaContainer.element.getWidth() / 2, 
                    -30
                ]
            }else{
                return null;
            }
            return elbowConnectorPos;
        },
        
        getElbowConnecterStyleFromDisplayInfo: function(taxaContainer, taxonBoxDisplayInfo){
            if(taxonBoxDisplayInfo.descendantIndex == Infinity){
                return 'dashed';
            }else{
                return 'solid';
            }
        },
        
        getElbowConnecterLineWidthFromDisplayInfo: function(taxaContainer, taxonBoxDisplayInfo){
            if(taxonBoxDisplayInfo.descendantIndex == Infinity){
                return 1;
            }else{
                return 2;
            }
        }
    }
});
