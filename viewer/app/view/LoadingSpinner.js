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

Ext.define('BioLadderOrg.view.LoadingSpinner', {
    xtype: 'loadingspinner',
    extend: 'Ext.Component',

    statics: {
        width: 46,
        height: 46
    },
    
    config: {
        centerX: 0,
        centerY: 0,
        scale: .5
    },

    initialize: function () {
        this.drawComponent();
    },
    
    updateCenterX: function(value) {
        this.setLeft(value - BioLadderOrg.view.LoadingSpinner.width / 2);
    },
    
    updateCenterY: function(value) {
        this.setTop(value - BioLadderOrg.view.LoadingSpinner.height / 2);
        
    },
    
    drawComponent: function() {
        var me=this,
            scale = this.getScale();
        
        var scaleString = 'scale('+scale+','+scale+')';
        
        var html=
            '<div class="x-loading-spinner">' + 
                '<span class="x-loading-top" style="-ms-transform: '+scaleString+';-webkit-transform: '+scaleString+';transform: '+scaleString+';"></span>' +
                '<span class="x-loading-right" style="-ms-transform: '+scaleString+' rotate(90deg);-webkit-transform: '+scaleString+' rotate(90deg);transform: '+scaleString+'; rotate(90deg)"></span>' +
                '<span class="x-loading-bottom" style="-ms-transform: '+scaleString+' rotate(180deg);-webkit-transform: '+scaleString+' rotate(180deg);transform: '+scaleString+' rotate(180deg);"></span>' + 
                '<span class="x-loading-left" style="-ms-transform: '+scaleString+' rotate(270deg);-webkit-transform: '+scaleString+' rotate(270deg);transform: '+scaleString+'; rotate(270deg)"></span>' +
            '</div>';

        me.setHtml(html);
    }
});
