import React from 'react';
import Button from '../../components/input/Button/Button'
import './LandingPage.css'

export default class LandingPage extends React.Component {
    render() {
        return (
            <main>
                <div className="hero">
                    <div className="hero-container">
                        <h1>Application that gives <br/> food and restaurant recomandations</h1>
                        <a href="/planner"> <Button text='Get Started' /></a>
                    </div>
                </div>
                <div className="articles">
                    <article>
                        <header>
                            <h3>Receive recomandations</h3>
                        </header>
                        <p>
                            Receive a recomandation of dishes from the restaurants from your area.
                        </p>
                        <footer>
                            <a href="/planner">
                                <Button text="Look it up" />
                            </a>
                        </footer>
                    </article>
                </div>
            </main>
        )
    }
}