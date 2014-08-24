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

Ext.define('BioLadderOrg.view.ChildCladePopup', {
    xtype: 'childCladePopup',
    extend: 'Ext.Panel',

    config: {
        control: {
            '#ChildCladePopupCloseBtn': {
                tap: function () {this.hide(); }
            }
        },
        border: 1,
        centered: true,
        hideOnMaskTap: true,
        items: [{
            xtype: 'titlebar',
            docked: 'top',
            title: 'Child Clade',
            items: [{
                xtype: 'button',
                html: 'close',
                align: 'right',
                ui: 'confirm',
                itemId: 'ChildCladePopupCloseBtn'
            }]
        }, {
            xtype: 'component',
            html: [
                '<p>',
                    'A child clade is a group of organizms that includes some of the members of it\'s parent clade and represents a later branching in evolution.',
                '</p><br>',
                '<p>',
                    'For example, the clade <a href="#Simian" target="_blank">Simian</a> has two child clades: ',
                    '<a href="#New World monkey" target="_blank">New World Monkeys</a> and <a href="#Catarrhini" target="_blank">Catarrhini</a> ',
                    '(<a href="#Old World monkey" target="_blank">Old World Monkeys</a> and <a href="#Ape" target="_blank">Apes</a>). ',
                    'This means that some of the first <a href="#Simian" target="_blank">Simians</a> split into two groups. ',
                    'One group was the ancestor of all <a href="#New World monkey" target="_blank">New World Monkeys</a>, ',
                    'and the other group was the ancestor of all <a href="#Catarrhini" target="_blank">Catarrhini</a>',
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
