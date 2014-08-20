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
            title: 'Using BioLadder.org',
            items: [{
                xtype: 'button',
                html: 'close',
                itemId: 'AboutCladesCloseBtn'
            }]
        }, {
            xtype: 'component',
            baseCls: 'about-clades-panel-text',
            html: [
                '<div style="float:right;padding-left:5px;padding-right:5px;text-align:center;">',
                    '<img src="resources/images/CursorExample.png" width="333px" height="205px" ><br><br>',
                    '<b>Clade Diagram:</b><br><img src="resources/images/cladeExample.png" width="207px" height="320px" >',
                '</div>',
                '<p>',
                    '<b>How to Navigate</b>',
                '</p><br>',
                '<p>',
                    'You can click on any of the named boxes to go to it. <br> Click on the magnifying glass for search.',
                '</p><br>',
                '<p>',
                    '<b>What are Clades?</b>',
                '</p><br>',
                '<p>',
                    'Biologists don\'t tend to make claims about direct ancestry and descent. Rather, ',
                    'they group animals by common ancestry into ',
                    '<a href="http://en.wikipedia.org/wiki/Clade" target="_blank">clades</a>.',
                '</p><br>',
                '<p>',
                    'A Clade consists of an organism and all its descendants. So, in the diagram to the right, ',
                    '<a href="#Coelurosauria" target="_blank">Coelurosauria</a> is a clade made of some animal ',
                    'and all its descendants, including <a href="#Tyrannosaurus" target="_blank">Tyrannosaurus</a> ',
                    'and <a href="#Bird" target="_blank">birds</a>. We probably haven\'t found the precise dinosaur that gave rise to Coelurosauria, but ',
                    'we still know that everything in Coelurosauria is related.',
                '</p><br>',
                '<p>',
                    'The clade diagram to the right shows us that <a href="#Bird" target="_blank">Birds</a> are ',
                    'more closeley related to the <a href="#Velociraptor" target="_blank">Velociraptor</a> than ',
                    'that <a href="#Compsognathus" target="_blank">Compsognathus</a>, and closer to that than to ',
                    'the <a href="#Tyrannosaurus" target="_blank">Tyrannosaurus</a>.',
                '</p><br>',
                '<p>',
                    'Some commonly known groups of organisms are not clades. For example, Reptiles are all ',
                    'members of the clade <a href="#Amniote" target="_blank">Amniota</a> that aren\'t birds ',
                    'and mammals. Reptiles are not a clade, since mammals and birds are descendant from the ',
                    'first reptiles.',
                '</p><br>',
                '<p>',
                    'As scientists do their research, they debate precisely how things are related, so many ',
                    'specifics of the tree on this site are likely to change, but the general shape of the ',
                    'tree of life is agreed upon.',
                '</p><br>'].join('')
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
