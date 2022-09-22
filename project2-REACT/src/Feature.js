import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap';
import { NavLink } from 'react-router-dom';

// Dropdown menu for selecting year
export function YearSelect(props) {
    let [isOpen, setOpen] = useState(false);
    let [selectedValue, setSelection] = useState('2015');

    const handleChange = (evt) => {
        setSelection(evt.target.value);
    }

    const handleSubmit = (evt) => {
        evt.preventDefault();
        props.callbackFun(selectedValue);
    }

    const toggleDropdown = () => {
        setOpen(prevState => !prevState);
    }

    // create dropdown list
    let selectionList = ['2015', '2016', '2017', '2018', '2019'];
    selectionList = selectionList.map((elem) => {
        return <DropdownItem key={elem} value={elem} onClick={handleChange}>{elem}</DropdownItem>;
    });

    return (
        <form className="select-input" onSubmit={handleSubmit} role="listbox" aria-label="list of selections of areas">
            <Dropdown direction="right" isOpen={isOpen} toggle={toggleDropdown} >
                <DropdownToggle caret color="primary">{selectedValue}</DropdownToggle>
                <DropdownMenu>
                    {selectionList}
                </DropdownMenu>
            </Dropdown>
            <br/>
            <button type="submit" className="submit-button">Search</button>
        </form>
    );
}

// text entry for selecting country
export function CountrySelect(props) {
    let [inputValue, setInput] = useState('');
    const handleChange = (evt) => {
        setInput(evt.target.value)
    }

    const handleSubmit = (evt) => {
        evt.preventDefault();
        props.callbackFun(inputValue);
    }

    return (
        <form className="text-input" onSubmit={handleSubmit} role="textbox" aria-label="textbox for selecting country for the table">
                <label htmlFor="country-for-table">
                    <h3>Find A Country:</h3>
                </label>
                <p>Get the data from {props.year}.</p>
                <input type="text" className="country-select"
                    placeholder="Type in a country name" aria-label="country name input" 
                    value={inputValue} onChange={handleChange} />
                <br/><br/>
                <button type="submit" className="submit-button">Search</button>
        </form>
    );
}

export function NavBar() {
    return (
        <section>
            <nav className="fixed-top">
                <div className="nav-left">
                    <span className="logo" aria-hidden="true">&nbsp;</span><b className="hide-mobile">World Happiness</b>
                    <NavLink className="nav-text" exact to="/">Home</NavLink>
                    <NavLink className="nav-text" to="/cards">DataCards</NavLink>
                    <NavLink className="nav-text" to="/table">DataTable</NavLink>
                </div>
                <div className="nav-right">
                    <NavLink className="hide-small" to='/login'><button aria-label="button for sign up">Sign Up</button></NavLink>
                    <NavLink to='/login'><button aria-label="button for log in">Log In</button></NavLink>
                </div>
            </nav>
        </section>
    );
}

export function Footer() {
    return (
        <footer>
            <p>
                &copy; 2021 University of Washington All rights reserved. Contact with 
                <a href="mailto:zhanz1@uw.edu" aria-label="Zhan's email"> Zhan</a>,
                <a href="mailto:qiaoyi@uw.edu" aria-label="Whitney's email"> Whitney</a>,
                <a href="mailto:zsun0510@uw.edu" aria-label="Jerry's email"> Jerry</a>
            </p>
        </footer>
    );
}