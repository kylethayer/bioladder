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

Ext.define('BioLadderOrg.view.AboutSimplifiedAncestryPanel', {
    xtype: 'aboutSimplifiedAncestryPanel',
    extend: 'Ext.Panel',

    config: {
        control: {
            '#AboutSimpAncestryCloseBtn': {
                tap: function () {this.hide(); }
            }
        },
        border: 1,
        centered: true,
        hideOnMaskTap: true,
        items: [{
            xtype: 'titlebar',
            docked: 'top',
            title: 'Simplified Ancestry',
            items: [{
                xtype: 'button',
                html: 'close',
                itemId: 'AboutSimpAncestryCloseBtn'
            }]
        }, {
            xtype: 'component',
            html: [
                '<div style="float:right;padding-left:5px;padding-right:5px;">',
                    '<b>Clade Diagram:</b><br><img src="resources/images/cladeExample.png" ><br><br>',
                    '<b>Simplified Ancestry:</b><br><img src="resources/images/simplifiedAncestryExample.png" style="float:right;"><br>',
                    '',
                '</div>',
                '<p>',
                    '<b>What is "simplified ancestry"?</b>',
                '</p><br>',
                    'Biologists don\'t tend to make claims about direct ancestry and descent. Rather, ',
                    'they group animals by common ancestry into ',
                    '<a href="http://en.wikipedia.org/wiki/Clade" target="_blank">clades</a>, so that biological trees ',
                    'of ancestors and descendants can be filled in more completely as we make new ',
                    'scientific discoveries.',
                '</p><br>',
                '<p>',
                    'For example, while a <a href="#Chicken" target="_blank">chicken</a> is not the direct descendant of ',
                    'a <a href="#Tyrannosaurus" target="_blank">Tyrannosaurus Rex<a>, it would appear in the same clade. ',
                    'We also know that <a href="#Compsognathus" target="_blank">Compsognathus<a> is higher in the ',
                    'evolutionary tree than either <a href="#Chicken" target="_blank">chickens</a> or ',
                    '<a href="#Tyrannosaurus" target="_blank">tyrannosaurs</a>, but we cannot say definitively that ',
                    '<a href="#Compsognathus" target="_blank">Compsognathus<a> is the direct ancestor of either species. For ',
                    'the purposes of this site, we choose to make the leap of showing ',
                    '<a href="#Compsognathus" target="_blank">Compsognathus<a> as the "simplified ancestor" of both ',
                    'species. This is for demonstration purposes&mdash;so that you can see the general flow of how species ',
                    'have evolved over time. While more species might get filled in later, it is unlikely ',
                    'that the evolutionary tree as a whole would change.',
                '</p>'].join(''),
            style: 'font-size: 16px; margin-left: 10px; margin-top: 5px; margin-right: 5px;'
        }],
        maxHeight: 600,
        maxWidth: 650,
        modal: true,
        height: "90%",
        scrollable: "vertical",
        width: "90%"
    },

    initialize: function () {
        this.on('hide', function () {this.destroy(); });
    }

});
