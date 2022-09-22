import { React, useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';

import { LandingPage } from './LandingPage';
import { IndexTablePage } from './IndexTablePage';
import { IndexCardPage } from './IndexCardPage';
import { NavBar, Footer } from './Feature';
import { LoginForm } from './LoginForm';
import firebase from 'firebase/app';
import { Spinner } from 'reactstrap';

export function App() {
    let [country, setMainCountry] = useState(undefined);
    let [user, setUser] = useState(undefined);
    let [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const authUnregisterFunction = firebase.auth().onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
            } else {
                setUser(undefined);
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
                setMainCountry(snapshot.val());
                setLoading(false);
            });
            return function cleanup() {
                message.off('value', listener);
            }
        }
    }, [user]);

    if (isLoading && country !== undefined) {
        return (
            <div>
                <NavBar />
                <main>
                    <div className="login"><Spinner color="primary" /></div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <NavBar />
            <main>
                <Switch>
                    <Route exact path="/" component={LandingPage} />
                    <Route exact path="/landing" component={LandingPage} />
                    <Route exact path="/table" component={IndexTablePage} />
                    <Route exact path="/cards" component={() => { return <IndexCardPage country={country} />; }} />
                    <Route exact path="/login" component={() => { return <LoginForm callbackFunc={setMainCountry} />; }} />
                </Switch>
            </main>
            <Footer />
        </div>
    );
}

export default App;