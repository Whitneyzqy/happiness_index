import React, { useState, useEffect } from 'react';
import { Table } from './Table';
import { YearSelect, CountrySelect } from './Feature';
import { Container } from 'reactstrap';
import 'whatwg-fetch';

function LeftSubpage(props) {
    return (
        <section className='left-subpage'>
            <header>
                <h1>Happiness Report Analysis</h1>
                <p>Click and get the corresponding data visualizations.</p>
            </header>
            <div className="tabcontent table">
                <h2>View Data Table</h2>
                <YearSelect callbackFun={props.handleYearSubmit} />
                <br/>
                <CountrySelect callbackFun={props.handleCountrySubmit} year={props.year} />
            </div>
            <cite className="citation">Data from
                <a href="https://www.kaggle.com/unsdsn/world-happiness" aria-label="link for data source from Kaggle">
                    {' Kaggle: World Happiness Report'}
                </a>
            </cite>
        </section>
    );
}

function MidSubpage(props) {
    return (
        <section className="mid-subpage">
            <Table data={props.data} handlePageNumClick={props.handlePageNumClick} pageNum={props.pageNum} countryCondition={props.countryCondition} />
        </section>
    );
}

export function IndexTablePage() {
    let [pageNum, setPageNum] = useState(0);
    let [yearState, setYearState] = useState('2015');
    let [countryState, setCountryState] = useState('');
    let [data, setData] = useState([]);

    // fetch data for table, if it is empty (representing an error), pass it to the table
    // element and table element will generate the error
    useEffect(() => {
        let unmounted = false;
        let url = 'data/' + yearState + '.csv';
        fetch(url)
        .then(function(response) {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error();
            }
        })
        .then(function(data) {
            if (!unmounted) {
                let out = [];
                for (let row of data.split('\n')) {
                    out.push(row.split(','));
                }
                // remove the last empty element
                out.pop();
                setData(out);
            }
        });
        return function cleanup() { unmounted = true; };
    }, [yearState]); 

    const handlePageNumClick = (operation) => {
        let pageGap = 15;
        let updatedPageNum = pageNum;
        if (operation === 'next') {
            let maxLimit = Math.ceil((data.length - 1) / pageGap);
            updatedPageNum += 1;
            if (updatedPageNum >= maxLimit) {
                updatedPageNum = maxLimit - 1;
            }
        } else if (operation === 'previous') {
            updatedPageNum -= 1;
            if (updatedPageNum < 0) {
                updatedPageNum = 0
            }
        }
        setPageNum(updatedPageNum);
    }

    const handleYearSubmit = (year) => {
        setYearState(year);
    }

    const handleCountrySubmit = (country) => {
        setCountryState(country);
    }

    return (
        <Container className="pages">
            <LeftSubpage handleYearSubmit={handleYearSubmit} handleCountrySubmit={handleCountrySubmit} year={yearState} />
            <MidSubpage countryCondition={countryState} data={data} handlePageNumClick={handlePageNumClick} pageNum={pageNum} />
        </Container>
    );
}