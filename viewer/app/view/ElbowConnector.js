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
    
    statics:{
        lineId: 0, //This counter is used to make sure each line element div has a unique id
    },

    config: {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        lineStyle: 'solid',
        lineWidth: 2
    },

    initialize: function () {
        this.__lineId = BioLadderOrg.view.ElbowConnector.lineId;
        BioLadderOrg.view.ElbowConnector.lineId += 1;
        this.drawComponent();
    },
    
    drawComponent: function() {
        var me=this;
        
        html = '';
        html += me.createHtmlForLine('line1_' + this.__lineId);
        html += me.createHtmlForLine('line2_' + this.__lineId);
        html += me.createHtmlForLine('line3_' + this.__lineId);
        this.setHtml(html);
    },
    
    animateTo: function(startPos, endPos, lineStyle, lineWidth){
        var me = this;
        me.setStartX(startPos[0]);
        me.setStartY(startPos[1]);
        me.setEndX(endPos[0]);
        me.setEndY(endPos[1]);
        me.setLineStyle(lineStyle);
        me.setLineWidth(lineWidth);
        if(!this.element){
            console.log('no element!');
            return;
        }

        this.animateLine('line1_' + this.__lineId);
        this.animateLine('line2_' + this.__lineId);
        this.animateLine('line3_' + this.__lineId);
    },
    
    animateLine: function(id){
        var me=this;
        
        var lineElement = this.element.down('#'+id);
        var currentStyle = lineElement.dom.style;
        
        var fromConfig = {   
            'left': currentStyle.left,
            'top': currentStyle.top,
            'height': currentStyle.height,
            'width': currentStyle.width,
        };
        var finalStyle = {
            'left': me.getDivLeft(id) + 'px',
            'top': me.getDivTop(id) + 'px',
            'height': me.getDivHeight(id) + 'px',
            'width': me.getDivWidth(id) + 'px',
        };
        finalStyle['border-'+me.getBorderSideToUse(id)+'-width'] = me.getLineWidth()+'px';
        finalStyle['border-'+me.getBorderSideToUse(id)+'-style'] = me.getLineStyle();
        
        var toConfig = {
            'left': me.getDivLeft(id) + 'px',
            'top': me.getDivTop(id) + 'px',
            'height': me.getDivHeight(id) + 'px',
            'width': me.getDivWidth(id) + 'px',
        };
        
        Ext.Animator.run({
            element: lineElement,
            duration: BioLadderOrg.view.TaxaContainerPositionCalculator.getAnimationDuration(),
            easing: 'ease-in-out',
            from: fromConfig,
            to: toConfig,
            onEnd: function(arguments){
                lineElement.setStyle(finalStyle);
            }
        });
    },
    
    fadeIn: function(){
        var me = this;

        Ext.Animator.run({
            element: me.element,
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
    
    fadeOut: function(callback){
        var me = this;
        Ext.Animator.run({
            element: me.element,
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
                callback(me);
            }
        });
    },
    
    getDivLeft: function(id){
        var me = this;
        if(id == 'line1_' + this.__lineId){
            return me.getStartX();
        }else if(id == 'line2_' + this.__lineId){
            if(me.getEndX() >= me.getStartX()){
                return me.getStartX();
            }else{
                return me.getEndX();
            }
        }else if(id == 'line3_' + this.__lineId){
            return me.getEndX();
        }
    },
    
    getDivTop: function(id){
        var me = this;
        if(id == 'line1_' + this.__lineId){
            return me.getStartY();
        }else if(id == 'line2_' + this.__lineId || id == 'line3_' + this.__lineId){
            return me.getStartY() + (me.getEndY() - me.getStartY()) / 2;
        }
    },
    
    getDivHeight: function(id){
        var me = this;
        if(id == 'line1_' + this.__lineId || id == 'line3_' + this.__lineId){
            return (me.getEndY() - me.getStartY()) / 2;
        }else if(id == 'line2_' + this.__lineId){
            return 0;
        }
    },
    
    getDivWidth: function(id){
        var me = this;
        if(id == 'line1_' + this.__lineId || id == 'line3_' + this.__lineId){
            return 0;
        }else if(id == 'line2_' + this.__lineId){
            if(me.getEndX() >= me.getStartX()){
                return me.getEndX() - me.getStartX();
            }else{
                return me.getStartX() - me.getEndX();
            }
        }
    },
    
    getBorderSideToUse: function(id){
        var me = this;
        if(id == 'line1_' + this.__lineId || id == 'line3_' + this.__lineId){
            return 'right';
        }else if(id == 'line2_' + this.__lineId){
            return 'bottom';
        }
    },
    
    createHtmlForLine: function(id){
        var me = this;
        html = '<div id="'+id+'" style="position:absolute;';
        html +=    'left:'+me.getDivLeft(id)+'px;';
        html +=    'top:'+me.getDivTop(id)+'px;';
        html +=    'height:'+me.getDivHeight(id)+'px;';
        html +=    'width:'+me.getDivWidth(id)+'px;';
        html +=    'border-'+me.getBorderSideToUse(id)+'-width:'+me.getLineWidth()+'px;';
        html +=    'border-'+me.getBorderSideToUse(id)+'-style:'+me.getLineStyle()+';">';
        html += '</div>';
        return html;
    }
});
