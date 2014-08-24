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
                align: 'right',
                ui: 'confirm ',
                itemId: 'AboutCladesCloseBtn'
            }]
        }, {
            xtype: 'component',
            baseCls: 'about-clades-panel-text',
            html: [
                '<p>',
                    '<b>What is BioLadder.org?</b>',
                '</p><br>',
                '<p>',
                    'BioLadder.org is a website that lets you see how life evolved by moving up and down the tree of life.',
                '</p><br>',
                '<div style="float:right;padding-left:5px;padding-right:5px;text-align:center;">',
                    '<br>', //spacing
                    '<img src="resources/images/CursorExample.png" width="333px" height="205px" ><br><br>',
                    '<img src="resources/images/searchExample.png" width="251px" height="298px" ><br><br>',
                    '<b>Clade Diagram:</b><br><img src="resources/images/cladeExample.png" width="207px" height="320px" >',
                '</div>',
                '<p>',
                    '<b>How do I navigate?</b>',
                '</p><br>',
                '<p>',
                    '* To close this help popup, press close above. ',
                    'To find this help again, press the question mark at the top right of the site.<br><br>',
                    '* To go up the tree of life (to earlier splits in evolution), click on the light blue box above the currently open one.<br><br>',
                    '* To go go down the tree of life (to later splits in evolution), click on any of the light blue boxes below the currently open one. The view will center on and open whichever one you click on.<br><br>',
                    '* To go go back, you can use the browser\'s back button.<br><br>',
                    '* To search, click on the magnifying glass in the top right corner and type in a name (eg. Life, Dinosaur, Dog), and click on the one you want.<br><br>',
                '</p><br>',
                  '<p>',
                    '<b>How is this site organized?</b>',
                '</p><br>',
                '<p>',
                    'This website shows the evolutionary tree of life through ',
                    '<a href="http://en.wikipedia.org/wiki/Clade" target="_blank">clades</a>.',
                '</p><br>',
                '<p>',
                    '<b>What are Clades?</b>',
                '</p><br>',
                '<p>',
                    'Biologists don\'t tend to make claims about direct ancestry and descent. Rather, ',
                    'they group animals by common ancestry into ',
                    '<a href="http://en.wikipedia.org/wiki/Clade" target="_blank">clades</a>*.',
                '</p><br>',
                '<p>',
                    'A Clade consists of an organism and all its descendants. For example, in the diagram to the right, ',
                    '<a href="#Coelurosauria" target="_blank">Coelurosauria</a> is a clade made of some dinosaur ',
                    'and all its descendants, including the giant <a href="#Tyrannosaurus" target="_blank">Tyrannosaurus</a> ',
                    'and all living <a href="#Bird" target="_blank">birds</a>. We probably haven\'t found the precise dinosaur that ',
                    'everything Coelurosauria descendent from, but ',
                    'we still know that everything in Coelurosauria is related.',
                '</p><br>',
                '<p>',
                    'The clade diagram to the right shows us that <a href="#Bird" target="_blank">Birds</a> are ',
                    'more closely related to the <a href="#Velociraptor" target="_blank">Velociraptor</a> (a small feathered dinosaur with sickle-shaped claws) than ',
                    'to the <a href="#Compsognathus" target="_blank">Compsognathus</a> (a small dinosaur the size of a turkey), and closer to the <a href="#Compsognathus" target="_blank">Compsognathus</a> than to ',
                    'the <a href="#Tyrannosaurus" target="_blank">Tyrannosaurus</a>.',
                '</p><br>',
                '<p>',
                    'As scientists do their research, they debate precisely how things are related, so many ',
                    'specifics of the tree on this site are likely to change, but the general shape of the ',
                    'tree of life is agreed upon.',
                '</p><br>',
                '<p style="font-size:10pt">',
                    '* Some commonly known groups of organisms are not clades, so you wont find them on this site. ',
                    'For example, mammals and birds are descended from reptiles, but not included in the group called "reptiles." ',
                    'Since the group "reptiles" doesn\'t include all its descendants, it is not a clade and can\'t be found on this site.',
                '</p><br>'].join('')
        }],
        maxHeight: 600,
        maxWidth: 650,
        modal: true,
        height: "90%",
        scrollable: "vertical",
        skipToClades: false, //used to scroll down to clades section
        width: "90%"
    },

    initialize: function () {
        this.on('hide', function () {this.destroy(); });
    },
    
    updateSkipToClades: function (newSkipToClades) {
        if(newSkipToClades){
            //I don't know a good way to compute where the clade section of the help popup is on the fly,
            // so I just hard coded a value
            this.getScrollable().getScroller().scrollTo(0, 650, false);
        }
    }

});
