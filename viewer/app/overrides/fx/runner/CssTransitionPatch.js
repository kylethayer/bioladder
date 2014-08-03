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

Ext.define('BioLadderOrg.overrides.fx.runner.CssTransitionPatch', {
    override: 'Ext.fx.runner.CssTransition',

    refreshRunningAnimationsData: function(element, propertyNames, interrupt, replace) {
        //For whatever reason, Firefox accepts the CSS transorm as "-moz-transform" but returns the property animated as "transform"
        // This just guarantees that "-moz-transform" is there for Firefox to handle properly.
        if(propertyNames.indexOf("transform") >= 0 && propertyNames.indexOf("-moz-transform") < 0){
            propertyNames.push("-moz-transform");
            console.warn("refreshRunningAnimationsData override2", propertyNames);
        }
        return this.callParent(arguments);
    }
});