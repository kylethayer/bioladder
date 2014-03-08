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
 
Ext.define('BioLadderOrg.view.ElbowConnector', {
    xtype: 'elbowconnector',
    extend: 'Ext.Component',

    requires: [
    ],

    config: {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        direction: 'vertical', //'vertical' as the first/last line or 'horizontal' as the first/last line
        lineStyle: 'solid',
        lineWidth: 2
    },

    initialize: function () {
        this.drawComponent();
    },
    
    drawComponent: function() {
        var me=this;
        
        html = '';
        if(this.getDirection() == 'vertical'){
             html += '<div style="position:absolute;left:'+me.getStartX()+'px;top:'+me.getStartY()+'px;';
             html += 'height:'+(me.getEndY() - me.getStartY()) / 2 +'px;border-right-width:'+me.getLineWidth()+'px;border-right-style:'+me.getLineStyle()+';"></div>';
             
             if(me.getEndX() >= me.getStartX()){
                 html += '<div style="position:absolute;left:'+me.getStartX()+'px;top:'+(me.getStartY() + (me.getEndY() - me.getStartY()) / 2)+'px;';
                 html += 'width:'+(me.getEndX() - me.getStartX()) +'px;border-bottom-width:'+me.getLineWidth()+'px;border-bottom-style:'+me.getLineStyle()+';"></div>';
             } else {
                 html += '<div style="position:absolute;left:'+me.getEndX()+'px;top:'+(me.getStartY() + (me.getEndY() - me.getStartY()) / 2)+'px;';
                 html += 'width:'+(me.getStartX() - me.getEndX()) +'px;border-bottom-width:'+me.getLineWidth()+'px;border-bottom-style:'+me.getLineStyle()+';"></div>';
             }
             
             html += '<div style="position:absolute;left:'+me.getEndX()+'px;top:'+(me.getStartY() + (me.getEndY() - me.getStartY()) / 2)+'px;';
             html += 'height:'+(me.getEndY() - me.getStartY()) / 2 +'px;border-right-width:'+me.getLineWidth()+'px;border-right-style:'+me.getLineStyle()+';"></div>';
        }else{
        
        }
        this.setHtml(html);
    }
});
