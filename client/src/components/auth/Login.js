import React, { Fragment, useState } from 'react'
import { Link } from 'react-router-dom';

function Login() {

    const [formData, setFormData] = useState({

        email: '',
        password: ''

    });

    const { email, password } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault();

    }
    return (
        <Fragment>
            <h1 className="large text-primary">Login</h1>
            <p className="lead"><i className="fas fa-user"></i> Login into your Acc</p>
            <form className="form" action="/api/user/login" method="Post" onSubmit={handleSubmit}>

                <div className="form-group">
                    <input
                        type="email"
                        placeholder="Email Address"
                        name="email"
                        onChange={handleChange}
                        value={email} />
                    <small className="form-text">This site uses Gravatar so if you want a profile image, use a
                    Gravatar email
          </small>
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        minLength="6"
                        onChange={handleChange}
                        value={password}
                    />
                </div>

                <input
                    type="submit"
                    className="btn btn-primary"
                    value="Register" />
            </form>
            <p className="my-1">
                Dont have an account? <Link to="/Register">Sign Up</Link>
            </p>
        </Fragment>
    )
}


export default Login;
