<?php

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

 $wgHooks['ArticleSave'][] = function ( &$article, &$user, &$text, &$summary, $minor, $watchthis, $sectionanchor, &$flags, &$status ) {
  //TODO: Detect if the Simplified ancestor changed, and if it did
  // set that old one to out of date: self.
  if($minor){ //ignore minor edits (especially bot edits, so as not to cause infinite loop problems)
    return true;
  }
  
  if(preg_match("/\|Popular Descendants Out Of Date=self and parent/", $text, $matches)){
    return true;
  }
  
  if(preg_match("/\|Popular Descendants Out Of Date=self/", $text, $matches)){
    $text = preg_replace("(\|Popular Descendants Out Of Date=self)", "|Popular Descendants Out Of Date=self and parent", $text);
    return true;
  }
  
  if(preg_match("/\|Popular Descendants Out Of Date=parent/", $text, $matches)){
    $text = preg_replace("(\|Popular Descendants Out Of Date=parent)", "|Popular Descendants Out Of Date=self and parent", $text);
    return true;
  }
  
  if(preg_match("/{{Entry/", $text, $matches)){
    $text = preg_replace("({{Entry)", "{{Entry\n|Popular Descendants Out Of Date=self and parent", $text);
  }
  
  return true;
};
