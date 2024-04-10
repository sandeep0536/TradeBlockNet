import React, { useState, useS } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import {
    Button,
    Icon,
    TextField
} from '@material-ui/core';
import {
    ScrollingProvider,
    useScrollSection,
    Section,
} from 'react-scroll-section';
import StaticMenu from './StaticMenu';
import { API_URL } from 'ServerConfig';
import { CircularProgress } from '@material-ui/core';
import { WEB3AUTH_CLIENTID } from 'ServerConfig';
import { makeStyles } from '@material-ui/core/styles'
import { getUserRole } from '../material-kit/projecttest/roles/UserRoles';
import history from "history.js"
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from "../material-kit/projecttest/SnackbarComponent";

let rows;
let plans;
let startDate;
let userInfo;

const useStyles = makeStyles((theme) => ({
    paragraph: {
        fontSize: "20px",
    },
    paragraphBlock: {
        fontSize: "20px",
        lineHeight: "1.3 !important",
        minHeight: "235px",
        maxHeight: "250px",
        overflowX: "auto"
    }
}))
const Home = () => {
    const urlData = useLocation();
    const classess = useStyles();
    const [status, setStatus] = useState(false);
    const [rows, setRows] = useState({});
    const [email, setEmail] = useState(null);
    const [query, setQuery] = useState(null);
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [progress, setProgress] = useState(false)
    function handleSnackbarClose(event, reason) {
        if (reason === 'clickaway') {
            return
        }
        setSuccess(null)
    }
    /**
     * function to handle error snackbar
     */
    function handleErrorClose(event, reason) {
        setError(null)
    }
    const token = urlData.pathname.split("/")[2];
    (async () => {
        try {
            if (localStorage.getItem("accessToken") != null)
                history.push("/dashboard/myfiles")
            if (token)
                localStorage.setItem("userToken", token)
        } catch (e) {
            console.log(e)
        }
    })();
    let interval = setInterval(() => {
        try {
            if (Object.keys(rows).length > 0) {
                setStatus(true);
                clearInterval(interval)
            }
        } catch (e) { }
    }, 100)
    const homeSection = useScrollSection('home');
    const pricingSection = useScrollSection('pricingTable');
    const helpSection = useScrollSection('help');
    async function sendMail() {
        if (email == null) setError("please enter valid email")
        else if (query == null) setError("please enter any Query")
        else {
            setProgress(true)
            const opts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: email,
                    email: query
                })
            }
            const res = await fetch(`${API_URL}/sendmail`, opts);
            const response = await res.json();
            console.log(response)
            if (response.status) {
                setProgress(false)
                setSuccess(response.msg)
                setEmail(null);
                setQuery(null);
            } else {
                setProgress(false)
                setError(response.error)
            }
        }
    }
    function handleEmail(e) {
        setEmail(e.target.value);
    }
    function handleQuery(e) {
        setQuery(e.target.value);
    }
    return (
        <ScrollingProvider>
            <main className="main" id="top">
                <StaticMenu token={token} />
                <Snackbar
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={success != null}
                    autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                >
                    <MySnackbarContentWrapper
                        onClose={handleSnackbarClose}
                        variant="success"
                        message={success}
                    />
                </Snackbar>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={error != null}
                    autoHideDuration={10000}
                    onClose={handleErrorClose}
                >
                    <MySnackbarContentWrapper
                        onClose={handleErrorClose}
                        variant="error"
                        message={error}
                    />
                </Snackbar>
                <Section id="home">
                    <div className="bg-holder"
                        style={{
                            backgroundImage: "url(assets/img/gallery/hero.png)",
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }}
                    >
                    </div>

                    <div className="container">
                        <div className="row align-items-center min-vh-50 min-vh-sm-75">
                            <div className="col-md-5 col-lg-6 order-0 order-md-1">
                                <img width="100%" src="assets/img/illustrations/hero-header.png" alt="..." />
                            </div>
                            <div className="col-md-7 col-lg-6 text-md-start text-center">
                                <h1 className="text-light fs-md-5 fs-lg-6">Blockchain platform for B2B trading</h1>
                                <p className={`${classess.paragraph} text-light`}>
                                    Switch from legacy VANs and outdated EDI tools with a future-proof Blockchain technology
                                    that exchanges any business document, in any data format, with your partner ecosystem around the world. It uses simple, secure, immutable, scalable, private, traceable, verifiable and resilient approach to enable it.
                                    Tradeblocknet provides a new platform for people and organizations for all industries to transact digitally supporting various interactions in the modern digital economies.
                                </p>
                                <div>
                                    <Link
                                        to={{
                                            pathname: "/signin",
                                        }}
                                    >
                                        <div className="btn btn-light order-1 order-lg-0 col-md-5">
                                            Free Trial
                                        </div>
                                    </Link>
                                    <div className="btn btn-light order-1 order-lg-0 col-md-5 ml-5" onClick={() => {
                                        document.getElementById('help').scrollIntoView();
                                    }}>
                                        Get a Demo
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-5 text-center mx-auto">
                            <h2>Our value proposition</h2>
                            <p className={`${classess.paragraph} mb-4`}>
                                Enables real-time digital collaboration with customers,
                                suppliers and partners ecosystem.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="container pt-4">
                    <div className="row">
                        <div className="col-xxl-5 text-center mx-auto">
                            <h2>What will you get if you'll join us</h2>
                            <p className={`${classess.paragraph} mb-4`}>
                                We are primarily a software as-a-service (SAAS) provider that enables organisations to setup network that connects all supply chain participants – such as buyers, sellers, logistic providers, banks and suppliers – to exchange digital data and documents and to automate many of their key business processes.
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-5 mb-md-0 ">
                            <div className="card card-span" style={{ backgroundColor: "#424D83" }}>
                                <div className="card-body p-4">
                                    <h5 className="text-light text-center" style={{ fontSize: "25px" }}>Features</h5>
                                    <p className={`${classess.paragraphBlock} text-light lh-lg`}>
                                        <ul style={{ paddingLeft: "1.4rem" }}>
                                            <li>Single sign-on portal</li>
                                            <li>Support for EDI formats e.g. ANSI ASC X12, UN/EDIFACT, E-invoice, Bill of lading, IOT</li>
                                            <li>Track and Trace of all documents</li>
                                            <li>Partner Directory and dashboard</li>
                                            <li>Direct and Network connect model</li>
                                            <li>User access management</li>
                                            <li>Support for API integration</li>
                                            <li>Blockchain decentralised infrastructure</li>
                                            <li>Flexible transactional based pricing</li>
                                        </ul>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-5 mb-md-0 ">
                            <div className="card card-span" style={{ backgroundColor: "#424D83" }}>
                                <div className="card-body p-4">
                                    <h5 className="text-light text-center" style={{ fontSize: "25px" }}>Benefits </h5>
                                    <p className={`${classess.paragraphBlock} text-light lh-lg`}>
                                        <ul style={{ paddingLeft: "1.4rem" }}>
                                            <li>Next generation of technology</li>
                                            <li>{"Lower trading costs by >30%"}</li>
                                            <li>Reduce complexity</li>
                                            <li>Improve visibility and transparency</li>
                                            <li>Increase productivity</li>
                                            <li>Accelerate on-boarding</li>
                                            <li>Data immutability, security</li>
                                            <li>Improved agility and resiliency</li>
                                            <li>Contract flexibility</li>
                                            <li>Higher availability</li>
                                        </ul>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Section className="py-0 py-xxl-6" id="help">
                    <div className="bg-holder" style={{
                        backgroundImage: "url(assets/img/gallery/footer-bg.png)",
                        backgroundPosition: "center",
                        backgroundSize: "cover"
                    }}>
                    </div>
                    <br /><br /><br /><br /><br /><br />
                    <Container>
                        <Row>


                            {/* <Col className=" col-md-4 col-xl-3 mb-3">
                                <h5 className="lh-lg fw-bold text-white">FEATURES</h5>
                                <ul className="list-unstyled mb-md-4 mb-lg-0">
                                    <li className="lh-lg"><a className="text-200 text-decoration-none" href="#!">Beginner Guide</a></li>
                                    <li className="lh-lg"><a className="text-200 text-decoration-none" href="#!">Move to Servion</a></li>
                                    <li className="lh-lg"><a className="text-200 text-decoration-none" href="#!">Website Builder</a></li>
                                    <li className="lh-lg"><a className="text-200 text-decoration-none" href="#!">Tools and Resources</a></li>
                                </ul>
                            </Col>
                            <Col className=" col-md-4 col-xl-3 mb-3">
                                <h5 className="lh-lg fw-bold text-white">SUPPORT</h5>
                                <ul className="list-unstyled mb-md-4 mb-lg-0">
                                    <li className="lh-lg"><a className="text-200 text-decoration-none" href="#!">Help Center</a></li>
                                    <li className="lh-lg"><a className="text-200 text-decoration-none" href="#!">Submit a Ticket</a></li>
                                    <li className="lh-lg"><a className="text-200 text-decoration-none" href="#!">Contact Us</a></li>
                                    <li className="lh-lg"><a className="text-200 text-decoration-none" href="#!">Blog</a></li>
                                </ul>
                            </Col> */}
                            <Col className="col-md-8">
                                <h5 className="lh-lg fw-bold text-white">Contact Us:</h5>
                                <ul className="list-unstyled list-inline mb-6 mb-md-0">
                                    <li className="list-inline-item mr-2">
                                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                            <Form.Control type="email" placeholder="useremail" onChange={handleEmail} />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" onChange={handleQuery}>
                                            <Form.Control as="textarea" rows={3}
                                                style={{ width: "500px" }}
                                                placeholder="enter some content">
                                            </Form.Control>
                                        </Form.Group>
                                    </li>
                                    <li>
                                        <Button color="primary" variant="contained" type="submit" disabled={progress} onClick={sendMail}>
                                            <Icon>send</Icon>
                                            <span className="pl-2 capitalize">Submit</span>
                                        </Button>
                                    </li>
                                </ul>
                            </Col>
                            <Col className="col-md-8 col-xl-4 mb-3" style={{ marginTop: "31px" }}>
                                <ul className="list-unstyled">
                                    <li className="lh-lg" style={{ listStyleType: "disc", color: "#fff", fontSize: "16px" }}>
                                        <a href="https://app.websitepolicies.com/policies/view/5sj5k6sy">Disclaimer</a>
                                    </li>
                                    <li className="lh-lg" style={{ listStyleType: "disc", color: "#fff", fontSize: "16px" }}>
                                        <a href="https://app.websitepolicies.com/policies/view/nkcnxktv">Privacy and Policy</a>
                                    </li>
                                    <li className="lh-lg" style={{ listStyleType: "disc", color: "#fff", fontSize: "16px" }}>
                                        <a href="https://app.websitepolicies.com/policies/view/y631skg3">Terms and Conditions</a>
                                    </li>
                                </ul>
                            </Col>
                        </Row>
                        <Row>
                            <center style={{ color: "#fff" }}>Copyright Chainmatrix.io 2022</center>
                        </Row>
                    </Container>
                </Section>
            </main>
        </ScrollingProvider >
    )
}

export default Home;