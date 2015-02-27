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
#https://github.com/jpatokal/mediawiki-gateway/blob/master/lib/media_wiki/gateway.rb
#https://www.mediawiki.org/wiki/API:Edit

WeightAgainstBranchFraction = 0.7

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

def processPopularSubtaxaForTaxon(taxonName)
  puts "processPopularSubtaxaForTaxon #{taxonName}..."
  queryResults = $mw.semantic_query("[[Has Parent Taxon::#{taxonName}]]", ['?Has Popular Subtaxa', '?Has Popularity'])
  descendants = queryResults.elements["query"].elements["results"].to_a
  #For each of the results gather the popular descendants and such
  
  newPopularSubtaxaString = findPopularSubtaxaString(descendants)
  
  currentTaxonText = $mw.get(taxonName)
  
  currentPopularSubtaxaMatch = /\|Popular Subtaxa=([^\n^\r^\|^}]*)/.match(currentTaxonText)
  if(currentPopularSubtaxaMatch)
    if(newPopularSubtaxaString == currentPopularSubtaxaMatch[1])
      currentTaxonText = markOutOfDateAsNoneInText(currentTaxonText)
      $mw.bot_edit(taxonName, currentTaxonText, {})
      return
    end
  end

  #Update this Taxon with the new popular entries
  if(currentPopularSubtaxaMatch)
    puts "updating PopularSubtaxa #{newPopularSubtaxaString}"
    currentTaxonText.sub!(/\|Popular Subtaxa=[^\n^\r^\|^}]*/, '|Popular Subtaxa=' + newPopularSubtaxaString)
  else
    puts "adding PopularSubtaxa #{newPopularSubtaxaString}"
    currentTaxonText.sub!(/\{\{Taxon/, "{{Taxon\n|Popular Subtaxa=" +newPopularSubtaxaString)
  end
    
  currentTaxonText = markAsParentOutOfDateInText(currentTaxonText)
  
  puts ""
  puts "saving #{taxonName}..."
  puts currentTaxonText
  puts ""
  $mw.bot_edit(taxonName, currentTaxonText, {})
end

def findPopularSubtaxaString(descendants)
  popularityEntries = []
  descendants.each do |descendant|
    descendantName = getEntryName(descendant)
    if(getEntryFieldValue(descendant, "Has Popularity"))
        descendantPopularity = getEntryFieldValue(descendant, "Has Popularity").to_f

        puts "#{descendantName}:#{descendantPopularity}"
        popularityEntries.push({
          :name => descendantName,
          :popularity => descendantPopularity,
          :orignal_popularity => descendantPopularity,
          :branch => descendantName
        })
    end
    
    #Get PopularSubtaxa w/ popularity and add to hash under current branch
    subPopularSubtaxa = getEntryField(descendant, "Has Popular Subtaxa").to_a
    subPopularSubtaxa.each do |subDescendant|
      subDescendantName = getEntryName(subDescendant)
      subQueryResults = $mw.semantic_query("[[#{subDescendantName}]]", ['?Has Popularity'])
      subDescendantResult = subQueryResults.elements["query"].elements["results"].first
      if(getEntryFieldValue(subDescendantResult, "Has Popularity"))
        subDescendantPopularity = getEntryFieldValue(subDescendantResult, "Has Popularity").to_f
        
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
  return newPopularSubtaxaString
end

def markOutOfDateAsNoneInText(taxonText)
  return taxonText.sub(/\|Popular Subtaxa Out Of Date[^\n^\r^\|^}]*/, '')
end

def markAsParentOutOfDateInText(currentTaxonText)
  currentOutOfDateMatch = /\|Popular Subtaxa Out Of Date=([^\n^\r^\|^}]*)/.match(currentTaxonText)
  if(currentOutOfDateMatch)
    if(!currentOutOfDateMatch[1].include?("parent"))
      newValue = "parent"
      if(currentOutOfDateMatch[1] == "self")
        newValue = "self and parent"
      elsif (currentOutOfDateMatch[1] == "children")
        newValue = "parent and children"
      elsif (currentOutOfDateMatch[1] == "self and children")
        newValue = "self and parent and children"
      end
      return currentTaxonText.sub(/\|Popular Subtaxa Out Of Date[^\n^\r^\|^}]*/, '|Popular Subtaxa Out Of Date='+newValue)
    end
  else
    return currentTaxonText.sub(/\{\{Taxon/, "{{Taxon\n|Popular Subtaxa Out Of Date=parent")
  end
  return currentTaxonText
end

def markTaxonAsSelfOutOfDate(taxonName)
  currentTaxonText = $mw.get(taxonName)
  currentOutOfDateMatch = /\|Popular Subtaxa Out Of Date=([^\n^\r^\|^}]*)/.match(currentTaxonText)
  if(currentOutOfDateMatch)
    if(currentPopularSubtaxaMatch[1].include?("self"))
	  return #Already marked
	end
    if(currentPopularSubtaxaMatch[1] == "")
      currentTaxonText.sub!(/\|Popular Subtaxa Out Of Date[^\n^\r^\|^}]*/, '|Popular Subtaxa Out Of Date=self')
    else
      currentTaxonText.sub!(/\|Popular Subtaxa Out Of Date[^\n^\r^\|^}]*/, '|Popular Subtaxa Out Of Date=self and '+currentPopularSubtaxaMatch[1])
    end
  else
    currentTaxonText.sub!(/\{\{Taxon/, "{{Taxon\n|Popular Subtaxa Out Of Date=self")
  end
  
  puts "Marking #{taxonName} as out of date"
  $mw.bot_edit(taxonName, currentTaxonText, {})
end

def processTaxon(entry)
  entryName = getEntryName(entry)
  outOfDate = getEntryFieldValue(entry, "Are Popular Subtaxa Out Of Date")
  
  if(outOfDate.include?('self'))
    processPopularSubtaxaForTaxon(entryName)
  end
  
  if(outOfDate.include?('parent'))
    parentTaxon = getEntryField(entry, "Has Parent Taxon").first
    if(parentTaxon)
      parentTaxonName = getEntryName(parentTaxon)
  
      #now mark the parentTaxon as needing to be updated
      markTaxonAsSelfOutOfDate(parentTaxonName)
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

def getEntryName(entry)
    return entry.attribute("fulltext").value
end

def getEntryField(entry, fieldName)
    entry.elements["printouts"].each do |a|
        if(a.attribute('label').to_s == fieldName)
            return a
        end
    end
    return nil
end

def getEntryFieldValue(entry, fieldName)
    entryField = getEntryField(entry, fieldName)
    if(entryField && entryField.first)
        return entryField.first.first.to_s
    end
    return nil
end


maxEntriesToProcess = 25
(1..maxEntriesToProcess).each do |i|
  entry = getNextOutOfDateTaxon()
  if(entry)
    puts "#{i}, #{getEntryName(entry)}"
    processTaxon(entry)
  else
    break
  end
  sleep(1) # pause to allow other non-bot requests to go through
end
