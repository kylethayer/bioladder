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

Ext.define('BioLadderOrg.view.AboutCladesPanel', {
    xtype: 'aboutCladesPanel',
    extend: 'Ext.Panel',

    config: {
        control: {
            '#AboutCladesCloseBtn': {
                tap: function () {this.hide(); }
            }
        },
        border: 1,
        centered: true,
        hideOnMaskTap: true,
        items: [{
            xtype: 'titlebar',
            docked: 'top',
            title: 'About Clades',
            items: [{
                xtype: 'button',
                html: 'close',
                itemId: 'AboutCladesCloseBtn'
            }]
        }, {
            xtype: 'component',
            baseCls: 'about-clades-panel-text',
            html: [
                '<p>',
                    '<b>What are Parent Taxa and Sub Taxa?</b>',
                '</p><br>',
                '<p>',
                    'This site uses clades, which are how evolutionary biologists categorize all ',
                    'organisms (see <a href="http://en.wikipedia.org/wiki/Clade" target="_blank">wikipedia</a> page).',
                '</p><br>',
                '<p>',
                    'A Clade is a taxon consisting of an organism an ancestor and all its descendants. ',
                    'Often we do not know precisely which organism was the ancestor of a clade. For ',
                    'example, the definition of  <a href="#Dinosaur" target="_blank">Dinosauria</a> is the ',
                    'last common ancestor of Triceratops and Birds, along with all its descendants, though we do not ',
                    'now which animal that common ancestor was.',
                '</p><br>',
                '<p>',
                    'Some commonly known groups of organisms are not clades. For example, Reptiles are all ',
                    'members of the clade <a href="#Amniote" target="_blank">Amniota</a> excluding birds ',
                    'and mammals. Reptiles is not a clade, since mammals and birds are descendant from the ',
                    'first reptiles.',
                '</p><br>',
                '<p>',
                    'BioLadder.org shows clades organized vertically so that each clade A is shown as a ',
                    'sub taxon of its parent taxon B above it (B is a larger clade that includes A).',
                '</p>'].join('')
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
