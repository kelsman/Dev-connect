import React from 'react'
import { Link } from 'react-router-dom';

function Landing() {
    return (
        <div>
            <section className="landing">
                <div className="dark-overlay">
                    <div class="landing-inner">
                        <h1 className="x-large">Developer Connector</h1>
                        <p className="lead">
                            Create a developer profile/portfolio, share posts and get help from
                            other developers
        </p>
                        <div class="buttons">
                            <Link to="/Register" className="btn btn-primary">Sign Up</Link>
                            <Link to="/Login" className="btn btn-light">Login</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Landing
