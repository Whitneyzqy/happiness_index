import React, { useState, useEffect } from 'react';
import { Card, CardText, CardBody, CardTitle, Row, Col, Container } from 'reactstrap';
import firebase from 'firebase/app';
import 'whatwg-fetch';

export function IndexCardPage(props) {
    let [data, setData] = useState([]);
    let [selection, setSelection] = useState(props.country || 'Switzerland');

    // fetch the data for cards
    useEffect(() => {
        let url = 'data/2015.csv';
        fetch(url)
        .then(function(response) {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error();
            }
        })
        .then(function(data) {
            let out = [];
            for (let row of data.split('\n')) {
                out.push(row.split(','));
            }
            // remove the last empty element
            out.pop();
            setData(out);
        });
        return function cleanup() {};
    }, []); 

    const handleSelection = (country) => {
        setSelection(country);
    }

    if (props.country === undefined || props.country === null) {
        return (
            <Container className="pages">
                <CardLeftSubpage />
                <CardMidSubpage data={data.slice(1, data.length)} handleSelection={handleSelection} />
                <CardRightSubpage selection={selection} />
            </Container>
        );
    } else {
        return (
            <Container className="pages">
                <CommentLeftSubpage />
                <CommentMidSubpage country={props.country} />
                <CardRightSubpage selection={selection} />
            </Container>
        );
    }

}

function CardLeftSubpage() {
    return (
        <section className="left-subpage">
            <CardPageDescription />
            <cite className="citation">Data from 
                <a href="https://www.kaggle.com/unsdsn/world-happiness" aria-label="link for data source from Kaggle">
                    {' Kaggle: World Happiness Report'}
                </a>
            </cite>
        </section>
    );
}

function CommentLeftSubpage() {
    return (
        <section className="left-subpage">
            <CommentDescription />
            <cite className="citation">Data from 
                <a href="https://www.kaggle.com/unsdsn/world-happiness" aria-label="link for data source from Kaggle">
                    {' Kaggle: World Happiness Report'}
                </a>
            </cite>
        </section>
    );
}

function CardPageDescription() {
    return (
        <div className="tabcontent cards">
            <h2>10 Happiest Countries in the World</h2>
            <p>
                Based on the reported happniess scores, we list the 10 happiest countries around the word. From these country cards,
                we could see that countries with the highest happiness index mostly located in Europe.
            </p>
            <p> 
                These countries also tend to have a strong domestic economy, great public health care, high level of indivial freedom. However,
                there is not a clear correlation between people's trust in governments and a country's happiness score.
            </p>
        </div>
    );
}

function CommentDescription() {
    return (
        <div className="tabcontent cards">
            <h2>Comments</h2>
            <p>
            You can login to your account and select a country. Then you can leave comments about your unique experience with this country.
            </p>
            <p> 
            And also you can see other people's comments about this country. Here you can find people with various perspectives, such as native people and tourists. By readings these comments, hope you will have a better insight about this country.            </p>
        </div>
    );
}

function CommentMidSubpage(props) {
    let [comments, setComments] = useState({});
    let country = props.country;

    useEffect(() => {
        const message = firebase.database().ref('comments').child(country);
        const listener = message.on('value', (snapshot) => {
            setComments(snapshot.val());
        });
        return function cleanup() {
            message.off('value', listener);
        }
    }, [comments, country]);

    if (!comments) {
        return (
            <section className='mid-subpage'>
                <div className='tabcontent cards'>
                    <p>There is no comments.</p>
                </div>
            </section>
        );
    }
    let output = [];
    let id = 0;
    
    for (let key in comments) {
        output.push(
                <Row key={id}>
                    <Col>
                        <CommentCard userName={comments[key].userName} comment={comments[key].comment} />
                    </Col>
                </Row>
        );
        id += 1;
    }

    return (
        <section className='mid-subpage'>
            <div className='tabcontent cards comment-cards'>
                <Container>
                    {output}
                </Container>
            </div>
    </section>
    );
}

function CommentCard(props) {
    return (
        <Card>
            <CardBody>
                <CardTitle tag="h3">{props.userName}</CardTitle>
                <CardText>
                    {props.comment}
                </CardText>
            </CardBody>
        </Card>
    );
}


function CardMidSubpage(props) {
    let data = props.data;
    let cardRow = [];
    for (let i = 0; i < 2; i++) {
        cardRow.push(<CardRow key={'row' + i} data={data.slice(i * 5, i * 5 + 5)} callbackFun={props.handleSelection} />);
    }
    return (
        <section className='mid-subpage'>
            <div className='tabcontent cards'>
                <Container>
                    {cardRow}
                </Container>
            </div>
        </section>
    );
}

function CardRow(props) {
    let data = props.data;
    return (
        <Row>
            {data.map(function (elem) {
                return <CountryCard callbackFun={props.callbackFun} key={elem[0]} data={elem} />; 
            })}
        </Row>
    );
}

function CountryCard(props) {
    return (
        <Col key={props[0]}>
            <Card>
                <CardBody>
                    <CardTitle tag="h3">{props.data[0]}</CardTitle>
                    <CardText>
                        Happiness Rank: 
                        {props.data[1]} <br/>
                        Happiness Index: 
                        {props.data[2]}
                    </CardText>
                    <button className="submit-button" onClick={() => { props.callbackFun(props.data[0]); }}>View More</button>
                </CardBody>
            </Card>
        </Col>
    );
}

function CardRightSubpage(props) {
    let countrySelection = props.selection;
    let [countryImage, setImage] = useState('');
    let [countryInfo, setInfo] = useState('');
    let [error, setError] = useState(false);

    // fetch url for country's flag
    useEffect(() => {
        let unmounted = false;
        let url = "https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=pageimages&piprop=original&format=json&titles=" + countrySelection.replace(' ', '%20');

        fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(imgUrl) {
            if (!unmounted) {
                setImage(imgUrl.query.pages[Object.keys(imgUrl.query.pages)].original.source);
            }
        })
        .catch(function() {
            if (!unmounted) {
                setError('Fail to load Image.');
            }
        });
        return function cleanup() { unmounted = true; };
    }, [countrySelection]);

    // fetch url for country's information
    useEffect(() => {
        let unmounted = false;
        let url = "https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=" + countrySelection.replace(' ', '%20');

        fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            if (!unmounted) {
                setInfo(result.query.pages[Object.keys(result.query.pages)].extract.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|").slice(0, 7).join(' '));
            }
        })
        .catch(function() {
            if (!unmounted) {
                setError('Fail to load Intro.');
            }
        });
        return function cleanup() { unmounted = true; };
    }, [countrySelection]);

    // report error if there is one
    if (!error) {
        return (
            <section className='right-subpage'>
                <h2>Country Information</h2>
                    <form method="GET" action="https://en.wikipedia.org/w/api.php" aria-label="search from Wiki">
                        <div><img src={countryImage} alt={countrySelection + "'s flag"}></img></div>
                        <div><p>{countryInfo}</p></div>
                    </form>
                    <cite className="citation">
                        Data from 
                        <a href="https://en.wikipedia.org/wiki/Main_Page" aria-label="link to data source from wikipedia">
                            {' Wikipedia'}
                        </a>
                    </cite>
            </section>
        );
    } else {
        return (
            <section className='right-subpage'>
                <h2>Country Information</h2>
                    <cite className="citation">
                        Data from 
                        <a href="https://en.wikipedia.org/wiki/Main_Page" aria-label="link to data source from wikipedia">
                            Wikipedia
                        </a>
                    </cite>
                    <div className="alerts"><p>{error}</p></div>
            </section>
        );
    }
    
}