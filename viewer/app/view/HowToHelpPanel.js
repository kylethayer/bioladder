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

Ext.define('BioLadderOrg.view.HowToHelpPanel', {
    xtype: 'howToHelpPanel',
    extend: 'Ext.Panel',

    config: {
        control: {
            '#HowToHelpCloseBtn': {
                tap: function () {this.hide(); }
            }
        },
        border: 1,
        centered: true,
        hideOnMaskTap: true,
        items: [{
            xtype: 'titlebar',
            docked: 'top',
            title: 'How to Help',
            items: [{
                xtype: 'button',
                html: 'close',
                align: 'right',
                ui: 'confirm',
                itemId: 'HowToHelpCloseBtn'
            }]
        }, {
            xtype: 'component',
            html: [
                
                '<p>',
                    'There are two primary ways to help:',
                '</p><br>',
                    '<a href="../wiki" target="_blank">Content</a>: You can edit the wiki, where ',
                    'the information for clades, photos, descriptions, and wikipedia links are saved.',
                '</p><br>',
                '<p>',
                    '<a href="hhttps://github.com/kylethayer/bioladder" target="_blank">Open Source ',
                    'Code</a>: BioLadder is an open source project hosted on github. ',
                    'You can help with the Wiki coding or with the Viewer coding.',
                '</p>'].join(''),
            style: 'font-size: 16px; margin-left: 10px; margin-top: 5px; margin-right: 5px;'
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
