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
                taxonBox = BioLadderOrg.view.TaxonBox.TaxonBox;
            if(taxonDescendantIndex == -1){
                x = taxaContainer.element.getWidth() / 2 - taxonBox.getWidth(false) / 2;
                y = this.topSpacing;
                return [x, y];
            }
            if(taxonDescendantIndex == 0){
                x = taxaContainer.element.getWidth() / 2 - taxonBox.getWidth(true) / 2;
                y = this.topSpacing + taxonBox.getHeight(false) + this.verticalSpacing;
                return [x, y];
            }
            if(taxonDescendantIndex == 1){
                var totalSiblingWidth  = siblingsCount * taxonBox.getWidth(false) + (siblingsCount - 1) * this.horizontalSpacing;
                x = (taxaContainer.element.getWidth() - totalSiblingWidth) / 2 + taxonSiblingIndex * (taxonBox.getWidth(false) + this.horizontalSpacing);
                y = this.topSpacing + taxonBox.getHeight(false) + this.verticalSpacing + taxonBox.getHeight(true) + this.verticalSpacing * 2;
                return [x, y];
            }
            if(taxonDescendantIndex == Infinity){
                var totalSiblingWidth  = siblingsCount * taxonBox.getHeight(false) + (siblingsCount - 1) * this.horizontalSpacing * 2;
                x = parentPosition[0] + (taxonBox.getWidth(false) - totalSiblingWidth) / 2 + taxonSiblingIndex * (taxonBox.getHeight(false) + this.horizontalSpacing * 2);
                y = parentPosition[1] + taxonBox.getHeight(false) + 2 * this.verticalSpacing;
                return [x, y];
            }
        },
        
        getPositionFromDisplayInfo: function(taxaContainer, taxonBoxDisplayInfo){
            var parentPos = null;
            if(taxonBoxDisplayInfo.descendantIndex == Infinity){ //if we need parent position
                parentPos = this.getPositionFromDisplayInfo(taxaContainer, taxonBoxDisplayInfo.parentTaxonDisplayInfo);
            }
            return this.getPosition(taxaContainer, taxonBoxDisplayInfo.descendantIndex, taxonBoxDisplayInfo.taxonSiblingIndex, taxonBoxDisplayInfo.siblingsCount, parentPos);
        }
    }
});
