import React from 'react';
import { Link } from "react-router-dom";
import './Header.css'

export default class Header extends React.Component {
    state = {
        hidden: false,
        mobile: false
    };

    handleClick = () => {
        this.setState({ hidden: !this.state.hidden })
    }

    renderLoginLink() {
        return (
            <Link to='/signin' onClick={() => this.setState({ hidden: !this.state.hidden })}>Log&nbsp;in</Link>
        )
    }
    render() {
        return (
            <header>
                <div id="logo">
                    <h2 className='mt-2'><a href="/">Meal Builder</a></h2>
                </div>

                <nav role="navigation" className={this.state.mobile ? "" : "hidden"}>
                    <Link to="/">Home</Link>

                    <Link to="/planner">Plan&nbsp;It</Link>
                </nav>
            </header>)
    }
}