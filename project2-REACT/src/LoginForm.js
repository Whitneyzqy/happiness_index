import { React, useEffect, useState } from 'react';
import { Spinner } from 'reactstrap';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import firebase from 'firebase/app';
import 'firebase/auth';

const uiConfig = {
    signInOptions: [
        {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: true
        },
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    credentialHelper: 'none',
    signInFlow: 'popup',
    callbacks: {
        signInSuccessWithAuthResult: () => false
    }
};

export function LoginForm(props) {
    let [isLoading, setLoading] = useState(true);
    let [user, setUser] = useState(undefined);
    let [userCountry, setUserCountry] = useState('');
    let [userPost, setUserPost] = useState('');
    let [dbLoading, setdbLoading] = useState(true);

    const handleCountryChange = (evt) => {
        setUserCountry(evt.target.value);
    }

    const handleCountrySubmit = (evt) => {
        evt.preventDefault();
        const message = firebase.database().ref('users').child(user.uid);
        message.set(userCountry);
    }

    const handlePostChange = (evt) => {
        setUserPost(evt.target.value);
    }

    const handlePostSubmit = (evt) => {
        evt.preventDefault();
        if (userCountry !== '' && userCountry !== null) {
            const message = firebase.database().ref('comments').child(userCountry);
            const addItem = {
                userID: user.uid,
                userName: user.displayName,
                comment: userPost
            };
            message.push(addItem);
        }
        setUserPost('');
    }

    useEffect(() => {
        const authUnregisterFunction = firebase.auth().onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                setLoading(false);
            } else {
                setUser(undefined);
                setLoading(false);
            }
        });
        return function cleanup() {
            authUnregisterFunction();
        }
    }, []);

    useEffect(() => {
        if (user) {
            const message = firebase.database().ref('users').child(user.uid);
            const listener = message.on('value', (snapshot) => {
                setUserCountry(snapshot.val());
                setdbLoading(false);
                props.callbackFunc(snapshot.val());
            });
            return function cleanup() {
                message.off('value', listener);
            }
        }
    }, [user, props]);

    const handleLogOut = () => {
        firebase.auth().signOut();
        props.callbackFunc(undefined);
    }

    if (isLoading) {
        return (<div className="login"><Spinner color="primary" /></div>);
    }

    let countryContent = (<Spinner color="primary" />);

    if (userCountry !== null && userCountry !== '' && !dbLoading) {
        countryContent = (<p>You've selected {userCountry}</p>);
    } else if ((userCountry === null || userCountry === '') && !dbLoading) {
        countryContent = (<p>Please select and submit your country.</p>);
    }

    if (user !== undefined) {
        return (
                <section>
                    <div className="login">
                        <h1>Welcome!{" " + user.displayName}</h1>
                        {countryContent}
                        <form className="text-input" onSubmit={handleCountrySubmit} role="textbox" aria-label="textbox for selecting country for the table">
                            <label htmlFor="country-for-account">
                                <h2>Country:</h2>
                            </label>
                            <input type="text" className="country-select" id="country-for-account"
                                placeholder="Type in a country name" aria-label="country name input" 
                                value={userCountry || ''} onChange={handleCountryChange} />
                            <br/>
                            <button type="submit" className="submit-button" aria-label="submit button">Submit</button>
                        </form>
                        <br/>
                        <form className="text-input" onSubmit={handlePostSubmit} role="textbox" aria-label="textbox for submitting comments">
                            <label htmlFor="comments-for-countries">
                                <h2>Comments:</h2>
                            </label><br/>
                            <textarea type="text" className="comments" id="comments-for-countries"
                                placeholder="Type your comments after submitting you country" aria-label="comments input" 
                                value={userPost} onChange={handlePostChange} />
                            <br/><br/>
                            <button type="submit" className="submit-button" aria-label="submit button">Submit</button>
                        </form>
                        <br/>
                        <button aria-label="button for sign out" className="submit-button" onClick={handleLogOut}>Sign Out</button>
                    </div>
                </section>
            );
        } else {
            return (
                <section>
                    <div className="login">
                        <h1>Sign Up or Log in!</h1>
                        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
                    </div>
                </section>
            )
        }
}

