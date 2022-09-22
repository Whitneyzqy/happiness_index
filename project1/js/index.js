'use strict';

let HIDE_MOBILE_INDEX = [3, 4, 5, 6, 7];

// This function is used to load csv data
// from the data folder.
// Note: the function need to be ran on live
// server (run `npm install live-server`)
// Pass in the function name for rendering the
// html, the only parameter should be
// the data itself
// data is in form [row1, row2, row3, ...]
// where row = [data1, data2, data3, ...]
function fetchData(funcName, fileName, condition = undefined) {
    let url = 'data/' + fileName + '.csv';

    // load local csv file, throw error if needed
    fetch(url)
    .then(function(response) {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Fail to load data!');
        }
    })
    .then(function(data) {
        let out = [];
        for (let row of data.split('\n')) {
            out.push(row.split(','));
        }
        // remove the last empty element
        out.pop();
        // decide if to add condition into the function
        if (condition == undefined) {
            funcName(out);
        } else {
            funcName(out, condition);
        }
    })
    .catch(function(err) {
        let errElem = document.createElement('p');
        errElem.textContent = err.message;
        document.querySelector('#table-alert').appendChild(errElem);
    });
}


// This function will render the header section of
// the data table
function renderTableHeader(headers) {
    // create the header
    let headElem = document.createElement('tr');
    // add th into the header
    for (let header of headers) {
        let titleElem = document.createElement('th');
        titleElem.textContent = header;
        if (HIDE_MOBILE_INDEX.includes(headers.indexOf(header))) {
            titleElem.classList.add('hide-mobile');
        }
        headElem.appendChild(titleElem);
    }

    // clear the thead and add the new header in
    let head = document.querySelector('.data-table thead');
    head.innerHTML = '';
    head.appendChild(headElem);
}

// This function will render the body of the data table
function renderTableBody(datas, start, limit) {
    // select the tbody, and make sure that the limit exceeds
    // the length of the data
    let bodyElem = document.querySelector('.data-table tbody');
    if (limit > datas.length) { limit = datas.length; }

    // load rows within the range given by start and limit
    for (let i = start; i < limit; i++) {
        let rowElem = document.createElement('tr');

        for (let elem of datas[i]) {
            let dataElem = document.createElement('td');
            dataElem.textContent = elem;
            if (HIDE_MOBILE_INDEX.includes(datas[i].indexOf(elem))) {
                dataElem.classList.add('hide-mobile');
            }
            rowElem.appendChild(dataElem);
        }
        bodyElem.appendChild(rowElem);
    }
}

// This function will render the buttons for switching pages
function renderTableButtons(datas) {
    // select and empty the footer
    let footElem = document.querySelector('.table-footer');
    footElem.innerHTML = '';

    // if there is more than 15 elements, render the buttons
    if (datas.length > 15) {
        // create previous and next button
        let previousElem = document.createElement('button');
        let nextElem = document.createElement('button');
        
        previousElem.textContent = 'Previous';
        nextElem.textContent = 'Next';
        // add click event listener so that tbody gets re-rendered with certain range
        previousElem.addEventListener('click', function() {
            document.querySelector('.data-table tbody').innerHTML = '';
            let currState = tablePageState - 1;
            if (currState == 0) {
                currState = 1;
            }
            tablePageState = currState;
            renderTableBody(datas.slice(1, datas.length), (currState - 1) * pageBreakNum, currState * pageBreakNum);
        });
        // add click event listener so that tbody gets re-rendered with certain range
        nextElem.addEventListener('click', function() {
            document.querySelector('.data-table tbody').innerHTML = '';
            let currState = tablePageState + 1;
            // make sure it does not exceeds the last page
            if (currState >= Math.ceil(datas.length / pageBreakNum)) {
                currState = Math.ceil(datas.length / pageBreakNum) - 1;
            }
            tablePageState = currState;
            renderTableBody(datas.slice(1, datas.length), (currState - 1) * pageBreakNum, currState * pageBreakNum);
        });
        // add the needed information
        previousElem.classList.add('submit-button');
        nextElem.classList.add('submit-button');
        footElem.appendChild(previousElem);
        footElem.appendChild(nextElem);
    }
}

// This function will render the whole table
function renderTable(datas, condition = undefined) {
    let parsedData = [];
    let firstRow = true;

    // filter the rows if there is condition
    for (let row of datas) {
        let desiredRow = row;

        if (firstRow) {
            parsedData.push(desiredRow);
            firstRow = false;
        } else {
            if (condition != undefined) {
                if (desiredRow[0] == condition.country) {
                    parsedData.push(desiredRow);
                }
            } else {
                parsedData.push(desiredRow);
            }
        }
    }

    renderTableHeader(parsedData[0]);
    // if no data is found, then warn user there is no data
    if (parsedData.length < 2) {
        document.querySelector('#table-warning').style.display = 'block';
    } else {
        renderTableBody(parsedData.slice(1, parsedData.length), 0, pageBreakNum);
    }
    renderTableButtons(parsedData);
}

// create a single card
function createCard(datas) {
    // create col
    let col = document.createElement('div');
    col.classList.add('col');
    col.style.margin = '2px';
    col.style.padding = '2px';
    // create card
    let card = document.createElement('div');
    card.classList.add('card');
    card.style.flexGrow = 1;
    // create card-body
    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    // add card-body to card
    card.appendChild(cardBody);
    // add p and information
    let cardTitle = document.createElement('p');
    cardTitle.textContent = datas[0];
    cardTitle.classList.add('card-title');
    cardBody.appendChild(cardTitle);
    let cardText = document.createElement('p');
    cardText.innerHTML = 'Happiness Rank: ' + datas[1] + '<br>Happiness Index: ' + datas[2];
    // add button
    let buttonElem = document.createElement('button');
    buttonElem.classList.add('submit-button');
    buttonElem.textContent = "See More";
    // refresh the right information subpage when clicked
    buttonElem.addEventListener('click', function() {
        introImgElem.innerHTML = '';
        introElem.innerHTML = '';
        fetchCountryImage(datas[0], introImgElem);
        fetchCountryInfo(datas[0], introElem);
    });
    cardBody.appendChild(cardText);
    cardBody.appendChild(buttonElem);
    col.appendChild(card);

    return col;
}

// This function will render the entire cards element
function renderCardsElem(datas) {
    datas = datas.slice(1, 11);
    let tracker = 0;
    for (let i = 0; i < 2; i++) {
        let rowElem = document.createElement('row');
        
        for (let j = 0; j < 5; j++) {
            let row = datas[tracker];
            tracker++;
            rowElem.appendChild(createCard(row));
        }
        cardsElem.appendChild(rowElem);
    }
}

// This function will allow to switch tabs in index page
function openTab(tab) {
    let contentElems = document.querySelectorAll('.tabcontent');
    // set all tabcontents to be none
    for (let elem of contentElems) {
        elem.style.display = 'none'
    }
    // display the desired tabcontents
    let showElem = document.querySelectorAll('.' + tab);
    for (let elem of showElem) {
        elem.style.display = 'block';
    }
}
  
// This function takes in a "search term" string as a
//parameter and uses the `fetch()` function to downloads 
// a list of country infromation from the wikipedia
const IMG_URL_TEMPLATE = "https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=pageimages&piprop=original&format=json&titles=";
const INFO_URL_TEMPLATE = "https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles="

// This function will fetch the country image by looking at
// wiki's api and get the image url as source
function fetchCountryImage(country, imgElem) {
    let url = IMG_URL_TEMPLATE + country.replace(' ', '%20');
    
    fetch(url)
    .then(function(response) {
        return response.json();
    })
    .then(function(imgUrl) {
        let addedElem = document.createElement('img');
        addedElem.src = imgUrl.query.pages[Object.keys(imgUrl.query.pages)].original.source;
        addedElem.alt = country + "'s Flag";
        imgElem.appendChild(addedElem);
    })
    .catch(function() {
        let errElem = document.createElement('p');
        errElem.textContent = "Fail to load image";
        let alertElem = document.querySelector('#img-alert');
        alertElem.style.marginLeft = "0px"
        alertElem.appendChild(errElem);
    });
}

// This function will search for the country's information from
// wiki and load it to the webstie
function fetchCountryInfo(country, introElem) {
    let url = INFO_URL_TEMPLATE + country.replace(' ', '%20');

    fetch(url)
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        let addedElem = document.createElement('p');
        let text = result.query.pages[Object.keys(result.query.pages)].extract.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|").slice(0, 6).join(' ');
        addedElem.textContent = text;

        introElem.appendChild(addedElem);
    })
    .catch(function() {
        let errElem = document.createElement('p');
        errElem.textContent = "Fail to load data";
        let alertElem = document.querySelector('#img-alert');
        alertElem.style.marginLeft = "0px"
        alertElem.appendChild(errElem);
    });
}

// load elements needed for the webpage
let cardtabElem = document.querySelector('#cards');
let tabletabElem = document.querySelector('#table');
let introImgElem = document.querySelector('#descrp-img');
let introElem = document.querySelector('#description');
let cardsElem = document.querySelector('#cards-container');

// define states for tracking the page's status
let tablePageState = 1;
let pageBreakNum = 15;
let yearState = '2015';
let fileNames = ['2015', '2016', '2017', '2018', '2019'];

// add event listeners for the buttons needed
cardtabElem.addEventListener('click', function() { openTab('cards'); });
tabletabElem.addEventListener('click', function() { openTab('table'); });
document.querySelector('#year-select').addEventListener('click', function(evt) {
    document.querySelector('#table-warning').style.display = 'none';
    evt.preventDefault();
    document.querySelector('.data-table tbody').innerHTML = '';
    let yearState = document.querySelector('#years').value;
    fetchData(renderTable, yearState);
});
document.querySelector('#country-select').addEventListener('click', function(evt) {
    evt.preventDefault();
    let condition = {country: document.querySelector('#country-for-table').value};
    document.querySelector('#table-warning').style.display = 'none';
    document.querySelector('.data-table tbody').innerHTML = '';
    for (let file of fileNames) {
        fetchData(renderTable, file, condition);
    }
    document.querySelector('#country-for-table').value = '';
})

// load init data to html
fetchData(renderTable, yearState);
fetchData(renderCardsElem, fileNames[fileNames.length - 1]);
fetchCountryImage("Finland", introImgElem);
fetchCountryInfo("Finland", introElem);
