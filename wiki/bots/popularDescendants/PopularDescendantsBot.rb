#
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
 #
 #

require 'rubygems'
require 'media_wiki'
#see https://github.com/jpatokal/mediawiki-gateway

#mw = MediaWiki::Gateway.new('http://bioladder.org/wiki/api.php')
puts "logging in"
$mw = MediaWiki::Gateway.new('http://localhost/wiki/api.php')
$mw.login('PopularDescendantsBot', 'asdf7234jklsrt-32lsdgp')

def $mw.bot_edit(title, content, options={})
  form_data = {'action' => 'edit', 'title' => title, 'text' => content, 'summary' => (options[:summary] || ""), 'token' => get_token('edit', title)}
  form_data['minor'] = true
  form_data['section'] = options[:section].to_s if options[:section]
  make_api_request(form_data)
end

#xml.elements["query"].elements["results"].first.name

#entry = mw.get("api.php?action=ask&query=[[Are Popular Descendants Out Of Date::true]]|?Has Simplified Ancestor|?Has Wikipedia Image|?Has Wikipedia Page|limit=1&format=json")

#Note: Make an edit plugin to set Descendants Out of Date to False on non-minor edits

#select by Are Popular Descendants Out Of Date=false (include '?Has Simplified Ancestor', '?Popular Descendants', '?Has Popularity')
#NOTE: Make this modify the parent then put the parent out of date (the out of date means parent needs to be processed)
#For each one (up to 50?) 
  # Do another ask to get Descendants ('?Popular Descendants', '?Has Popularity')
  # combine the Popular Descendants and popularity of the descendants to generate a new list
  # load the page and if that is different than the current one,
    # change:
      # the Popular Descendants, 
      # mark self as out of date
      # mark the Ancestor as out of date
  #else
    # mark it as not out of date
  #NOTE: SAVES ARE MINOR SO WE DON'T GO INTO INFINITE LOOP
  
WeightAgainstBranchFraction = 0.6

#BUG: Change in popularity is not carried up if it doesn't change the immediate parent!!! Need to embed the popularities somehow!!!
  
  
def processPopularDescendantsForEntry(simplifiedAncestorName)
  puts "processPopularDescendantsForEntry #{simplifiedAncestorName}..."
  queryResults = $mw.semantic_query("[[Has Simplified Ancestor::#{simplifiedAncestorName}]]", ['?Has Popular Descendants', '?Has Popularity'])
  descendants = queryResults.elements["query"].elements["results"].to_a
  #For each of the results gather the popular descendants and such
  popularityEntries = []
  descendants.each do |descendant|
    descendantName = descendant.name
    if(descendant.elements["printouts"].elements["Has_Popularity"].first)
        descendantPopularity = descendant.elements["printouts"].elements["Has_Popularity"].first.first.to_s.to_f

        puts "#{descendantName}:#{descendantPopularity}"
        popularityEntries.push({
          :name => descendantName,
          :popularity => descendantPopularity,
          :orignal_popularity => descendantPopularity,
          :branch => descendantName
        })
    end
    
    #Get PopularDescendants w/ popularity and add to hash under current branch
    subPopularDescendants = descendant.elements["printouts"].elements["Has_Popular_Descendants"].to_a
    subPopularDescendants.each do |subDescendant|
      subDescendantName = subDescendant.attribute('fulltext').value
      subQueryResults = $mw.semantic_query("[[#{subDescendantName}]]", ['?Has Popularity'])
      subDescendantResult = subQueryResults.elements["query"].elements["results"].first
      if(subDescendantResult.elements["printouts"].elements["Has_Popularity"].first)
        subDescendantPopularity = subDescendantResult.elements["printouts"].elements["Has_Popularity"].first.first.to_s.to_f
        puts "#{subDescendantName}:#{subDescendantPopularity}"
        popularityEntries.push({
          :name => subDescendantName,
          :popularity => subDescendantPopularity,
          :orignal_popularity => subDescendantPopularity,
          :branch => descendantName
        })
      end
    end
  end
  
  popularityEntries = popularityEntries.sort_by{|a| [a[:popularity], a[:name]]}
  newPopularDescendants = []
  
  newPopular = popularityEntries.last
  if(newPopular)
    newPopularDescendants.push({:name => newPopular[:name], :popularity => newPopular[:orignal_popularity]})
  end
  popularityEntries.delete(newPopular)
  
  popularityEntries.each do |popularityHash|
    if(popularityHash[:branch] == newPopular[:branch])
      popularityHash[:popularity] = popularityHash[:popularity] * WeightAgainstBranchFraction
    end
  end
  
  popularityEntries = popularityEntries.sort_by{|a| [a[:popularity], a[:name]]}
  newPopular = popularityEntries.last
  if(newPopular)
    newPopularDescendants.push({:name => newPopular[:name], :popularity => newPopular[:orignal_popularity]})
  end
  
  newPopularDescendantsString = newPopularDescendants.map{|pd| "#{pd[:name]}]](#{pd[:popularity]})"}.join(",")
  
  ancestorEntryText = $mw.get(simplifiedAncestorName)
  
  currentPopularDescendantsMatch = /\|Popular Descendants=([^\n^\r^\|^}]*)/.match(ancestorEntryText)
  if(currentPopularDescendantsMatch)
    if(newPopularDescendantsString == currentPopularDescendantsMatch[1])
        ancestorEntryText.sub!(/\|Popular Descendants Out Of Date[^\n^\r^\|^}]*/, '')
        $mw.bot_edit(simplifiedAncestorName, ancestorEntryText, {})
      return
    end
  end
  #Update this entry with the new popular entries
  if(currentPopularDescendantsMatch)
    puts "updating PopularDescendants #{newPopularDescendantsString}"
    ancestorEntryText.sub!(/\|Popular Descendants=[^\n^\r^\|^}]*/, '|Popular Descendants=' + newPopularDescendantsString)
  else
    puts "adding PopularDescendants #{newPopularDescendantsString}"
    ancestorEntryText.sub!(/\{\{Entry/, "{{Entry\n|Popular Descendants=" +newPopularDescendantsString)
  end
  
  if(/\|Popular Descendants Out Of Date[^\n^\r^\|^}]*/.match(ancestorEntryText))
    ancestorEntryText.sub!(/\|Popular Descendants Out Of Date[^\n^\r^\|^}]*/, '|Popular Descendants Out Of Date=parent')
  else
    ancestorEntryText.sub!(/\{\{Entry/, "{{Entry\n|Popular Descendants Out Of Date=parent")
  end
  puts ""
  puts "saving #{simplifiedAncestorName}..."
  puts ancestorEntryText
  puts ""
  $mw.bot_edit(simplifiedAncestorName, ancestorEntryText, {})
end

#https://github.com/jpatokal/mediawiki-gateway/blob/master/lib/media_wiki/gateway.rb
#https://www.mediawiki.org/wiki/API:Edit




def processEntry(entry)
  entryName = entry.name
  outOfDate = entry.elements["printouts"].elements["Are_Popular_Descendants_Out_Of_Date"].first.first

  
  if(outOfDate == 'self' or outOfDate == 'self and parent')
    processPopularDescendantsForEntry(entryName)
  end
  
  if(outOfDate == 'parent' or outOfDate == 'self and parent')
    simplifiedAncestor = entry.elements["printouts"].elements["Has_Simplified_Ancestor"].first
    if(simplifiedAncestor)
      simplifiedAncestorName = simplifiedAncestor.attribute('fulltext').value
  
      #now find all descendants of the simplifiedAncestor and their ('?Popular Descendants', '?Has Popularity')
      processPopularDescendantsForEntry(simplifiedAncestorName)
    end
  end
  pageText = $mw.get(entryName)
    
  pageText.sub!(/\|Popular Descendants Out Of Date[^\n^\r^\|^}]*/, '')
  
  puts ""
  puts "saving #{entryName}..."
  puts pageText
  puts ""
  $mw.bot_edit(entryName, pageText, {})
  return true
end

  
def getNextOutOfDateEntry
  queryResults = $mw.semantic_query(
    '[[Are Popular Descendants Out Of Date::+]]', 
    ['?Are Popular Descendants Out Of Date','?Has Simplified Ancestor', '?Popular Descendants', '?Has Popularity', 'limit=1']
  )
  return queryResults.elements["query"].elements["results"].first
end

maxEntriesToProcess = 25
(1..maxEntriesToProcess).each do |i|
  entry = getNextOutOfDateEntry()
  if(entry)
    puts "#{i}, #{entry.name}"
    processEntry(entry)
  else
    puts "completed"
    break
  end
  sleep(1) # pause to allow other non-bot requests to go through
end
