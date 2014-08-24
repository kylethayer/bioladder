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

Ext.define('BioLadderOrg.view.ParentCladePopup', {
    xtype: 'parentCladePopup',
    extend: 'Ext.Panel',

    config: {
        control: {
            '#ParentCladePopupCloseBtn': {
                tap: function () {this.hide(); }
            }
        },
        border: 1,
        centered: true,
        hideOnMaskTap: true,
        items: [{
            xtype: 'titlebar',
            docked: 'top',
            title: 'Parent Clade',
            items: [{
                xtype: 'button',
                html: 'close',
                align: 'right',
                ui: 'confirm',
                itemId: 'ParentCladePopupCloseBtn'
            }]
        }, {
            xtype: 'component',
            html: [
                '<p>',
                    'A parent clade is a group of organizms that includes all its children clades ',
                    'and represents an earlier branching in evolution.',
                '</p><br>',
                '<p>',
                    'For example, the clade <a href="#Simian" target="_blank">Simian</a> is made up of ',
                    'monkeys and apes. The parent clade <a href="#Haplorhini" target="_blank">Haplorhini</a> ',
                    'includes all <a href="#Simian" target="_blank">Simians</a> along with ',
                    '<a href="#Tarsier" target="_blank">Tarsier</a> (small primates with huge eyes). <a href="#Tarsier" target="_blank">Tarsiers</a> ',
                    'split from <a href="#Simian" target="_blank">Simians</a> earlier in evolutionary history ',
                    'than monkeys and apes split.',
                '</p><br>'].join(''),
            style: 'font-size: 16px; margin-left: 10px; margin-top: 5px; margin-right: 5px;'
        }, {
            xtype: 'button',
            baseCls: 'no-formatting',
            html: '<span id="moreCladeInfoBtn" class="no-underline-link-btn" style="font-size:12px;font-weight:bold">Click here</span> <span style="font-size:12px">for more about clades.</span>',
            listeners: {
                tap: function(obj, e){
                    if(e.target.id == "moreCladeInfoBtn"){
                        Ext.Viewport.add({xtype:'aboutCladesPanel', skipToClades:true});
                    }
                },
            }
        }],
        maxHeight: 300,
        maxWidth: 400,
        modal: true,
        height: "90%",
        scrollable: "vertical",
        width: "90%"
    },

    initialize: function () {
        this.on('hide', function () {this.destroy(); });
    }

});
