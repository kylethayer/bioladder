import {navigateToTaxon, d3Update} from "./controllers/mainController.js"
import {allTaxaDictionary} from "./models/allTaxa.js"


const myModal = document.getElementById('searchModal')
const searchInput = document.getElementById('search-text')

function searchTaxa(){

    let relevantTaxa = Object.values(allTaxaDictionary).filter((taxonInfo) => 
            taxonInfo.getSearchText().toLowerCase().includes(searchInput.value.trim().toLowerCase()))
    let orderedRelevantTaxa = relevantTaxa.sort((a, b) => {
        if(a.popularity && b.popularity){
            return b.popularity - a.popularity
        }else if(a.popularity){
            return -1
        }else if(b.popularity){
            return 1
        } else{
            return b.length - a.length
        }
    })

    let searchResults = document.getElementById("searchResults")
    
    searchResults.innerHTML =""
    orderedRelevantTaxa.forEach(taxon => {
        var li = document.createElement("li");
        li.classList.add("list-group-item")
        li.setAttribute("data-bs-dismiss", "modal")
        li.innerText = taxon.getSearchText()
        li.onclick = () => {
            searchInput.value = ""
            searchResults.innerHTML = ""
            window.location.hash = "#" + encodeURIComponent(taxon.name);
        }
        searchResults.appendChild(li)
    })
}

myModal.addEventListener('shown.bs.modal', () => {
    searchInput.focus()
    searchInput.oninput = searchTaxa
})



window.onhashchange = function () {
    if(window.location.hash){
        let taxonName = window.location.hash.substring(1);
        taxonName = decodeURIComponent(taxonName)
        navigateToTaxon(taxonName);
    } else{
        window.location.hash = "#human";
    } 
}

if(!window.location.hash){
    window.location.hash = "#human";
} else {
    window.onhashchange() // first time loading make sure to trigger the first navigation
}


d3.select(window).on('resize', () => {d3Update()});





export default {}