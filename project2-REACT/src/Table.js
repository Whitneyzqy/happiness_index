import React from 'react';

function TableHeader(props) {
    let headers = props.headers;
    let HIDE_INDEX = [3, 4, 5, 6 ,7];
    // handle if the props passed is empty
    if (headers === undefined) {
        headers = [];
    }

    let headerRow = headers.map((header) => {
        if (HIDE_INDEX.includes(headers.indexOf(header))) {
            return (<th key={header} className="hide-mobile">{header}</th>);
        } else {
            return (<th key={header}>{header}</th>);
        }
    });

    return (
        <thead>
            <tr>
                {headerRow}
            </tr>
        </thead>
    );
}

function TableRow(props) {
    let row = props.row;
    let HIDE_INDEX = [3, 4, 5, 6 ,7];
    row = row.map((elem) => {
        if (HIDE_INDEX.includes(row.indexOf(elem))) {
            return (<td className="hide-mobile" key={elem}>{elem}</td>);
        } else {
            return (<td key={elem}>{elem}</td>);
        }
    });
    return (
        <tr>
            {row}
        </tr>
    );
}

function TableBody(props) {
    let rows = props.rows;

    rows = rows.map((row) => {
        return (<TableRow row={row} key={row[0]} />);
    });
    return (
        <tbody>
            {rows}
        </tbody>
    );
}

function TableBotton(props) {
    return (
        <div className='table-footer'>
            <button className='submit-button' onClick={() => { props.callbackFunc('previous'); }}>Previous</button>
            <button className='submit-button' onClick={() => { props.callbackFunc('next'); }}>Next</button>
        </div>
    );
}

export function Table(props) {
    let headers = props.data[0];
    let countryCondition = props.countryCondition;
    let pageNum = props.pageNum;
    let parsedData = [];
    let pageGap = 15;

    let data = props.data.slice(1, props.data.length);
    data = data.slice(pageNum * pageGap, (pageNum + 1) * pageGap);

    if (data.length !== 0) {
        for (let row of data) {
            if (countryCondition !== '') {
                if (row[0] === countryCondition) {
                    parsedData.push(row);
                }
            } else {
                parsedData.push(row);
            }
        }
    }
 
    if (parsedData.length < 1) {
        return (
            <div className='table data-table-frame'>
                <table className='data-table'>
                    <TableHeader headers={headers} />
                </table>
                <div className="alerts"><p>No data, please check you input!</p></div> 
            </div>
        );
    } else if (countryCondition !== '') {
        return (
            <div className='table data-table-frame'>
                <table className='data-table'>
                    <TableHeader headers={headers} />
                    <TableBody rows={parsedData} countryCondition={props.countryCondition} />
                </table>
            </div>
        );
    } else {
        return (
            <div className='table data-table-frame'>
                <table className='data-table'>
                    <TableHeader headers={headers} />
                    <TableBody rows={parsedData} countryCondition={props.countryCondition} />
                </table>
                <TableBotton callbackFunc={props.handlePageNumClick} />
            </div>
        );
    }
}