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
        border: 1,
        centered: true,
        hideOnMaskTap: true,
        items: [{
            xtype: 'titlebar',
            docked: 'top',
            title: 'Simplified Ancestry'
        }, {
            xtype: 'component',
            html: [
                '<div style="float:right;">',
                    '<img src="resources/images/cladeExample.png" ><br><br>',
                    '<img src="resources/images/simplifiedAncestryExample.png" style="float:right;">',
                '</div>',
                '<p>',
                    'Scientists set up their classification system using ',
                    '<a href="http://en.wikipedia.org/wiki/Clade">clades</a>, so they can show common ',
                    'ancestry without ever saying species "A" descended from species "B" (top diagram). ',
                    'After all, "B" may have actually descended from some undiscovered cousin species of "A."',
                '</p><br>',
                '<p>',
                    'Bioladder.org uses a simplified ancestry system that makes that leap of showing ',
                    '"A" as the ancestor of "B" for demonstration purposes (bottom diagram).',
                '</p><br>',
                '<p>',
                    'We hope future versions to be able to show both our simplified ancestry, and the ',
                    'cladistic classifications together.',
                '</p>'].join(''),
            style: 'font-size: 16px; margin-left: 10px; margin-top: 5px; margin-right: 5px;'
        }],
        modal: true,
        height: 420,
        width: 420
    },

    initialize: function () {
        this.on('hide', function () {this.destroy(); });
    }

});
