<?php

#  Copyright (C) 2013 BioLadder.Org
#
#  This file is part of the BioLadder.Org project (http://bioladder.org/)
#
#  BioLadder.Org is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.


require_once( "$IP/extensions/Validator/Validator.php" );

require_once( "$IP/extensions/SemanticMediaWiki/SemanticMediaWiki.php" );
enableSemantics('localhost');
$smwgShowFactbox = SMW_FACTBOX_NONEMPTY;
$smwgShowFactboxEdit = SMW_FACTBOX_NONEMPTY;

require_once( "$IP/extensions/SemanticForms/SemanticForms.php" );

$wgAllowExternalImagesFrom = array('http://bioladder.org/');
