import React, { Fragment, useState } from 'react'
import { Link } from 'react-router-dom';
// import axios from 'axios'
function Register() {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: ''
    });

    const { name, email, password, password2 } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== password2) {
            console.log('password do not match');
        }
    }
    return (
        <Fragment>

            <h1 className="large text-primary">Sign Up</h1>
            <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
            <form className="form" action="/api/user/register" method="Post" onSubmit={handleSubmit}>
                <div className="form-group">

                    <input type="text"
                        placeholder="Name"
                        name="name" required
                        onChange={handleChange}
                        value={name} />
                </div>
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
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        name="password2"
                        minLength="6"
                        onChange={handleChange}
                        value={password2}
                    />
                </div>
                <input
                    type="submit"
                    className="btn btn-primary"
                    value="Register" />
            </form>
            <p className="my-1">
                Already have an account? <Link to="/Login">Sign In</Link>
            </p>
        </Fragment>
    )
}

export default Register
