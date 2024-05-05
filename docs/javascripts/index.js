import {navigateToTaxon, d3Update} from "./controllers/mainController.js"

const myModal = document.getElementById('exampleModal')
const myInput = document.getElementById('myInput')

myModal.addEventListener('shown.bs.modal', () => {
  //myInput.focus()
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

d3.select(window).on('resize', d3Update);





export default {}