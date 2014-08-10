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
require 'yaml'
#see https://github.com/jpatokal/mediawiki-gateway

credentials = YAML.load_file('LoginCredentials.yaml')
$mw = MediaWiki::Gateway.new(credentials['URL'])
$mw.login(credentials['UserName'], credentials['Password'])

def $mw.bot_edit(title, content, options={})
  form_data = {'action' => 'edit', 'title' => title, 'text' => content, 'summary' => (options[:summary] || ""), 'token' => get_token('edit', title)}
  form_data['minor'] = true
  form_data['bot'] = true
  form_data['section'] = options[:section].to_s if options[:section]
  make_api_request(form_data)
end

WeightAgainstBranchFraction = 0.7

def processPopularSubtaxaForTaxon(parentTaxonName)
  puts "processPopularSubtaxaForTaxon #{parentTaxonName}..."
  queryResults = $mw.semantic_query("[[Has Parent Taxon::#{parentTaxonName}]]", ['?Has Popular Subtaxa', '?Has Popularity'])
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
    
    #Get PopularSubtaxa w/ popularity and add to hash under current branch
    subPopularSubtaxa = descendant.elements["printouts"].elements["Has_Popular_Subtaxa"].to_a
    subPopularSubtaxa.each do |subDescendant|
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
  

  newPopularSubtaxa = []
  
  (1..3).each do |i|
    #get most popular entry
    popularityEntries = popularityEntries.sort_by{|a| [a[:popularity], a[:name]]}
    newPopular = popularityEntries.last
    if(newPopular)
      newPopularSubtaxa.push({:name => newPopular[:name], :popularity => newPopular[:orignal_popularity]})
    end
    popularityEntries.delete(newPopular)
  
    # weigh against the remaining in that same branch
    popularityEntries.each do |popularityHash|
      if(popularityHash[:branch] == newPopular[:branch])
        popularityHash[:popularity] = popularityHash[:popularity] * WeightAgainstBranchFraction
      end
    end
  end
  
  newPopularSubtaxaString = newPopularSubtaxa.map{|pd| "#{pd[:name]}]](#{pd[:popularity]})"}.join(",")
  
  ancestorTaxonText = $mw.get(parentTaxonName)
  
  currentPopularSubtaxaMatch = /\|Popular Subtaxa=([^\n^\r^\|^}]*)/.match(ancestorTaxonText)
  if(currentPopularSubtaxaMatch)
    if(newPopularSubtaxaString == currentPopularSubtaxaMatch[1])
        ancestorTaxonText.sub!(/\|Popular Subtaxa Out Of Date[^\n^\r^\|^}]*/, '')
        $mw.bot_edit(parentTaxonName, ancestorTaxonText, {})
      return
    end
  end
  #Update this Taxon with the new popular entries
  if(currentPopularSubtaxaMatch)
    puts "updating PopularSubtaxa #{newPopularSubtaxaString}"
    ancestorTaxonText.sub!(/\|Popular Subtaxa=[^\n^\r^\|^}]*/, '|Popular Subtaxa=' + newPopularSubtaxaString)
  else
    puts "adding PopularSubtaxa #{newPopularSubtaxaString}"
    ancestorTaxonText.sub!(/\{\{Taxon/, "{{Taxon\n|Popular Subtaxa=" +newPopularSubtaxaString)
  end
  
  if(/\|Popular Subtaxa Out Of Date[^\n^\r^\|^}]*/.match(ancestorTaxonText))
    ancestorTaxonText.sub!(/\|Popular Subtaxa Out Of Date[^\n^\r^\|^}]*/, '|Popular Subtaxa Out Of Date=parent')
  else
    ancestorTaxonText.sub!(/\{\{Taxon/, "{{Taxon\n|Popular Subtaxa Out Of Date=parent")
  end
  puts ""
  puts "saving #{parentTaxonName}..."
  puts ancestorTaxonText
  puts ""
  $mw.bot_edit(parentTaxonName, ancestorTaxonText, {})
end

#https://github.com/jpatokal/mediawiki-gateway/blob/master/lib/media_wiki/gateway.rb
#https://www.mediawiki.org/wiki/API:Edit




def processTaxon(entry)
  entryName = entry.name
  outOfDate = entry.elements["printouts"].elements["Are_Popular_Subtaxa_Out_Of_Date"].first.first

  
  if(outOfDate == 'self' or outOfDate == 'self and parent')
    processPopularSubtaxaForTaxon(entryName)
  end
  
  if(outOfDate == 'parent' or outOfDate == 'self and parent')
    parentTaxon = entry.elements["printouts"].elements["Has_Parent_Taxon"].first
    if(parentTaxon)
      parentTaxonName = parentTaxon.attribute('fulltext').value
  
      #now find all descendants of the parentTaxon and their ('?Popular Subtaxa', '?Has Popularity')
      processPopularSubtaxaForTaxon(parentTaxonName)
    end
  end
  pageText = $mw.get(entryName)
    
  pageText.sub!(/\|Popular Subtaxa Out Of Date[^\n^\r^\|^}]*/, '')
  
  puts ""
  puts "saving #{entryName}..."
  puts pageText
  puts ""
  $mw.bot_edit(entryName, pageText, {})
  return true
end

  
def getNextOutOfDateTaxon
  queryResults = $mw.semantic_query(
    '[[Are Popular Subtaxa Out Of Date::+]]', 
    ['?Are Popular Subtaxa Out Of Date','?Has Parent Taxon', '?Popular Subtaxa', '?Has Popularity', 'limit=1']
  )
  return queryResults.elements["query"].elements["results"].first
end

maxEntriesToProcess = 25
(1..maxEntriesToProcess).each do |i|
  entry = getNextOutOfDateTaxon()
  if(entry)
    puts "#{i}, #{entry.name}"
    processTaxon(entry)
  else
    break
  end
  sleep(1) # pause to allow other non-bot requests to go through
end
