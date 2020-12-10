import React, { Fragment } from 'react';
import { Link } from 'react-router-dom'
const Navbar = () => {
    return (
        <Fragment>
            <nav className="navbar bg-dark">
                <h1>
                    <a href="index.html"><i className="fas fa-code"></i> DevConnector</a>
                </h1>
                <ul>
                    <li><Link to="profiles">Developers</Link></li>
                    <li><Link to="/Register">Register </Link></li>
                    <li><Link to="/login">Login</Link></li>
                </ul>
            </nav>

        </Fragment>

    )
}

export default Navbar;