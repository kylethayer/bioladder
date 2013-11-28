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

 var taxonBoxContentsTpl = new Ext.XTemplate(
    '<tpl if="wikipediaImage">',
        '<img style="float:left; display:inline; max-width:250px; max-height:250px; margin-right: 5px; margin-bottom:5px" src="{wikipediaImage}"/>',
    '<tpl elseif="exampleMember">',
        '<div style="float:left; display:inline; height:250px; width:250px; border: solid; padding: 5px; margin-right: 5px; margin-bottom:5px">',
            '{exampleMemberText:htmlEncode}<br>',
            '<small>{exampleMember.data.name}</small><br>',
            '<tpl if="exampleMember.data.wikipediaImage">',
                '<img style="max-width:235px; max-height:180px;" src="{exampleMember.data.wikipediaImage}"/>',
            '<tpl else>',
                'Loading Example Member...',
            '</tpl>',
        '</div>',
    '<tpl else>',
        'No image or example Member<br>',
    '</tpl>',
    '<div style="font-size: 15px;">',
        '<tpl if="scientificName">',
            '<b>Scientific Name:</b> {scientificName:htmlEncode}<br><br>',
        '</tpl>',
        '<tpl if="otherNames">',
            '<b>Other Names:</b> {otherNames:htmlEncode}<br><br>',
        '</tpl>',
        '<tpl if="description">',
            '<b>Description:</b> {[Ext.String.htmlEncode(values.description).replace(/\\n/g,"<br>");]}<br><br>', //todo html encode, replace \n with <br>
        '<tpl else>',
            'No description<br><br>',
        '</tpl>',
        '<br><small>Text and images based on Wikipedia and other Wikimedia Sources.</small>',
    '</div>'
);
 
Ext.define('BioLadderOrg.view.TaxonBox.TaxonBoxContents', {
    xtype: 'taxonboxcontents',
    extend: 'Ext.Container',

    requires: [
        'Ext.Label',
        'Ext.String'
    ],

    config: {
        data: null,
        tpl: taxonBoxContentsTpl,
    },
});
