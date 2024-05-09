function getDetailsDiv(d){
    let detailsDiv = document.createElement("div")
    detailsDiv.className = "taxon-details"

    let detailsContentDiv = document.createElement("div")
    detailsContentDiv.className = "taxon-details-content"
    detailsDiv.append(detailsContentDiv)

    if(d.taxon.isExtinct !== undefined){
        let p = document.createElement("p")
        let label = document.createElement("strong")
        label.innerText = "Status: "
        p.append(label)
        p.append(document.createTextNode(d.taxon.isExtinct? "Extinct" : "Living"))
        detailsContentDiv.append(p)
    }
    
    if(d.taxon.scientificName){
        let p = document.createElement("p")
        let label = document.createElement("strong")
        label.innerText = "Scientific name: "
        p.append(label)
        p.append(document.createTextNode(d.taxon.scientificName))
        detailsContentDiv.append(p)
    }

    if(d.taxon.otherNames){
        let p = document.createElement("p")
        let label = document.createElement("strong")
        label.innerText = "Other Names: "
        p.append(label)
        p.append(document.createTextNode(d.taxon.otherNames.join(", ")))
        detailsContentDiv.append(p)
    }

    if(d.taxon.taxonomicRank){
        let p = document.createElement("p")
        let label = document.createElement("strong")
        label.innerText = "Taxonomic Rank: "
        p.append(label)
        p.append(document.createTextNode(d.taxon.taxonomicRank))
        detailsContentDiv.append(p)
    }

    if(d.taxon.description){
        let p = document.createElement("p")
        let label = document.createElement("strong")
        label.innerText = "Description: "
        p.append(label)
        p.append(document.createTextNode(d.taxon.description))
        detailsContentDiv.append(p)
    }

    // extra space to account for wiki link footer
    let spacerP = document.createElement("p")
    spacerP.innerHTML = " &nbsp;"
    detailsContentDiv.append(spacerP)

    if(d.taxon.wikipediaPage){
        let detailsWikiDiv = document.createElement("div")
        detailsWikiDiv.className = "taxon-wiki-div"
        detailsDiv.append(detailsWikiDiv)
        let p = document.createElement("p")
        let a = document.createElement("a")
        a.innerText = "Wikipedia Source"
        a.setAttribute('href', d.taxon.wikipediaPage)
        a.setAttribute('target', '_blank')
        p.append(a)
        detailsWikiDiv.append(p)
    }

    return detailsDiv.outerHTML
} 

export default getDetailsDiv