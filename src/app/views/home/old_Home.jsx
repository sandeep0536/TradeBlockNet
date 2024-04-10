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
    const token = urlData.pathname.split("/")[2];
    const homeSection = useScrollSection('home');
    const pricingSection = useScrollSection('pricingTable');
    const helpSection = useScrollSection('help');
    (async () => {
        try {
            if (token)
                localStorage.setItem("userToken", token)
        } catch (e) {
            console.log(e)
        }
    })();

    return (
        <ScrollingProvider>
            <main className="main" id="top">
                <StaticMenu token={token} />
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
                                <h1 className="text-light fs-md-5 fs-lg-6">Share Files Easy and Secure</h1>
                                <p className={`${classess.paragraph} text-light`}>
                                    State-of-the-art Decentralised Secure, Private and Confidential Data sharing 3.0 platform
                                    based on Blockchain technology with incentives to build an ecosystem/network directory of your partners to identify the owner, send, receive, share and trace information and messages in an immutable, safe, secure and verifiable way with its own data identity. We allow users to share data without losing control and ownership of it that can be traced to source and get rewarded by Nxt Tokens for sharing as an incentive.
                                </p>
                                <p className={`${classess.paragraph} text-light`}>
                                    We provide a new platform for people and organizations for all industries to transact digitally supporting various interactions in the modern digital economies.
                                </p>
                                <div>
                                    <div className="btn btn-light order-1 order-lg-0 col-md-5 ml-5">
                                        Free Trial
                                    </div>
                                    <div className="btn btn-light order-1 order-lg-0 col-md-5 ml-5">
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
                                We address the issues security, privacy, user-transparency and control, and incentives for data storage, data sharing and ownership via a new platform that relies on organisational/user-controlled privacy and data-sharing policies encoded in smart contracts.                                </p>
                        </div>
                    </div>
                </div>
                <div className="container pt-4">
                    <div className="row">
                        <div className="col-xxl-5 text-center mx-auto">
                            <h2>What will you get if you'll join us</h2>
                            <p className={`${classess.paragraph} mb-4`}>
                                There are privacy and security problems associated with storing personal or organisation data. Even the most prominent online services have experienced security breaches and data theft. When trust resides within a centralised service provider for all the storage of data, it could be affected with centrality issues such as intentionally deleting the user data or not delivering the user data due to a technical failure.
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-5 mb-md-0 ">
                            <div className="card card-span" style={{ backgroundColor: "#424D83" }}>
                                <div className="card-body p-4">
                                    <h5 className="text-light text-center" style={{ fontSize: "25px" }}>Share and Transfer</h5>
                                    <p className={`${classess.paragraphBlock} text-light lh-lg`}>
                                        {`Streamline and reduce complexity by consolidating all secure file sharing activities for your organisation and partners. With unique Decentralized identifiers (DIDs) a new type of identifier that enables verifiable, decentralized digital identity to trust the content for authenticity between organisations or users. Create, share and transfer ownership of files as projects in any browser, desktop, phone, or tablet without VPN.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-5 mb-md-0 ">
                            <div className="card card-span" style={{ backgroundColor: "#424D83" }}>
                                <div className="card-body p-4">
                                    <h5 className="text-light text-center" style={{ fontSize: "25px" }}>Secure and Private </h5>
                                    <p className={`${classess.paragraphBlock} text-light lh-lg`}>
                                        {`Single Sign-on with Social logins or Third party Crypto Wallets for easy access along with cryptographic (Hash) auditing features.All information sharing is non-custodial, encrypted along with maintaining privacy using your own Crypto Wallet. Secure link sharing eliminates email attachments and FTP, even for the largest files. Password-protect any file, automatically expire access, and securely collect files from users outside of  your organisation or people.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-5 mb-md-0 ">
                            <div className="card card-span" style={{ backgroundColor: "#424D83" }}>
                                <div className="card-body p-4">
                                    <h5 className="text-light text-center" style={{ fontSize: "25px" }}>Track and Trace</h5>
                                    <p className={`${classess.paragraphBlock} text-light lh-lg`}>
                                        {`Track and trace documents or products using DID  shared with multiple partners and its users that are verifiable for compliance along with traceability and enabling superior data management.It tracks who shared what, with whom, when, by what means and for what purposes in a verifiable fashion.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-5 mb-md-0 ">
                            <div className="card card-span" style={{ backgroundColor: "#424D83" }}>
                                <div className="card-body p-4">
                                    <h5 className="text-light text-center" style={{ fontSize: "25px" }}>Controls</h5>
                                    <p className={`${classess.paragraphBlock} text-light lh-lg`}>
                                        {`Information user access controls that can restrict access to the information to only those that require access and with an expiry date to revoke access.Provide the ability to manage responsibilities and control who has uploading, viewership, editing, deletion, transfer of ownership and  access to projects and files.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="pt-4 bg-soft-primary">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 col-xxl-5 text-center mx-auto mb-5">
                                <h2>Some of the use cases for Nextfileshare</h2>
                                <p className="mb-5">One Platform. Limitless Opportunities for information sharing in Web 3.0</p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-5 mb-md-0 ">
                                <div className="card card-span" style={{ backgroundColor: "#424D83" }}>
                                    <div className="card-body p-4">
                                        <h5 className="text-light text-center" style={{ fontSize: "25px" }}>Supply chain</h5>
                                        <p className={`${classess.paragraphBlock} text-light lh-lg`}>
                                            {`Modern supply chains are highly complex, involving multiple partners/companies network who send shipments and take ownership and/or custody of shipments from the point of origin through to the final destination, be that a retailer or end consumer.
Modern supply chains are complex and sometimes sensitive, so many companies exchange information in various Industry standards file formats e.g. EDI for  Purchase Orders, Invoices, Shipping notices, Bill of Lading,  taking ownership and/or custody of shipments from the point of origin through to the final destination, be that a retailer or end consumer. And the manufacturers can't be sure which retailer or retail store will receive each specific product instance. 

If a retailer, pharmacy or end consumer needs to know that the information or product is genuine, they can use the traceability data. A downstream party may want to check whether Document or product ID and serial numbers were actually issued by the manufacturer.
Transparency in supply chains is increasingly important to consumers, who want to know what is in their food and where it originates.

A manufacturer may not want its competitors to know where its food ingredients are sourced from, and may want to restrict access to its data. Secured information transfer along with decentralized Identifiers with restricted role based access controls could be generated by sending and receiving parties to share, transfer or prove control of the identified shipment.

Nextfileshare platform  can be used  to build an ecosystem of partners to send, receive, share, transfer ownership and trace information with unique Decentralised Identity (DID)  between their organizations using decntralised highly secured Blockchain technology. It also enables an audit trail of events only to the participants involved - while preserving total confidentiality and full data, identity, and business connection privacy. Manage responsibilities and control who has viewership, editing, and deletion access to projects and files.`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 mb-5 mb-md-0 " >
                                <div className="card card-span" style={{ backgroundColor: "#424D83" }}>
                                    <div className="card-body p-4">
                                        <h5 className="text-light text-center" style={{ fontSize: "25px" }}>Store and Use your own data </h5>
                                        <p className={`${classess.paragraphBlock} text-light lh-lg`}>
                                            {`If you  require it to support the entire document lifecycle in one platform, including signature collection, form-filling, project data rooms, approvals, project milestones, and store forward many data format types including IoT data and more.
                                                If you want to store, search, share, transfer ownership sensitive data e.g proposals, contracts, certificates, titles, Digital assets, but you don't want them to be able to see any metadata about the data you store. If you want to share your data with others, you can include an expiration date and revoke the access at any time.
                                                Nextfileshare platform can be used  to send, receive, share, transfer ownership and trace information with their own unique Decentralised Identity (DID)  between you/organisations and your recipients. All files and interactions are logged and auditable. Designate roles and permissions for your clients, staff, partners, vendors, and others. Manage responsibilities and control who has viewership, editing, and deletion access to projects and files.`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </section>
                <Section className="pt-6" id="pricingTable">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 col-xxl-5 text-center mx-auto mb-5">
                                <h2>Types of plans that we provide</h2>
                                <p className="mb-5">Our service is always affordable for everyone. </p>
                            </div>
                        </div>
                        <Row>
                            {/*<Col>
                                <div className="card card-span shadow py-4 border-top border-4 border-primary">
                                    <div className="card-body">
                                        <div className="text-center"><img src="assets/img/icons/shared-hosting.png" alt="..." />
                                            <h5 className="my-3">Sandbox</h5>
                                            <ul className="list-unstyled">
                                                <li>Some minimal token fees</li>
                                                <li>upto 10 Files</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="border-top bg-white text-center pt-3 pb-0">
                                        <p className="mb-0">Get started at </p>
                                        <div className="d-flex justify-content-center">
                                            <h3 className="fw-normal">Free</h3>
                                        </div>
                                        <div className="d-flex justify-content-center">
                                            <a className="btn btn-primary" href="/signin" role="button">Free</a>
                                        </div>
                                    </div>
                                </div>

                            </Col> */}
                            {/* <Col>
                                <div className="card card-span shadow py-4 border-top border-4 border-primary">
                                    <div className="card-body">
                                        <div className="text-center"><img src="assets/img/icons/vpn-hosting.png" alt="..." />
                                            <h5 className="my-3">Bronze</h5>
                                            <ul className="list-unstyled">
                                                <li>Plain file sharing </li>
                                                <li>upto 100 Files / month</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="border-top bg-white text-center pt-3 pb-0">
                                        <p className="mb-0">Get started at </p>
                                        <div className="d-flex justify-content-center">
                                            <h3 className="fw-normal">10$/month</h3>
                                        </div>
                                        <div className="d-flex justify-content-center">
                                            <a className="btn btn-primary" href="/signin" role="button">Subscribe</a>
                                        </div>
                                    </div>
                                </div>

                            </Col> */}
                            {/* <Col>
                                <div className="card card-span shadow py-4 border-top border-4 border-primary">
                                    <div className="card-body">
                                        <div className="text-center"><img src="assets/img/icons/cloud-hosting.png" alt="..." />
                                            <h5 className="my-3">Silver</h5>
                                            <ul className="list-unstyled">
                                                <li>Wallet Payment</li>
                                                <li>upto 200 Files / month</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="border-top bg-white text-center pt-3 pb-0">
                                        <p className="mb-0">Get started at </p>
                                        <div className="d-flex justify-content-center">
                                            <h3 className="fw-normal">20$/month</h3>
                                        </div>
                                        <div className="d-flex justify-content-center">
                                            <a className="btn btn-primary" href="/signin" role="button">Subscribe</a>
                                        </div>
                                    </div>
                                </div>

                            </Col> */}
                            {/* <Col>
                                <div className="card card-span shadow py-4 border-top border-4 border-primary">
                                    <div className="card-body">
                                        <div className="text-center"><img src="assets/img/icons/cloud-hosting.png" alt="..." />
                                            <h5 className="my-3">Gold</h5>
                                            <ul className="list-unstyled">
                                                <li>B2B Wallet Payment </li>
                                                <li>upto 500 Files / month</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="border-top bg-white text-center pt-3 pb-0">
                                        <p className="mb-0">Get started at </p>
                                        <div className="d-flex justify-content-center">
                                            <h3 className="fw-normal">30$/month</h3><span className="d-flex align-items-center">/month</span>
                                        </div>
                                        <div className="d-flex justify-content-center">
                                            <a className="btn btn-primary" href="/signin" role="button">Subscribe</a>
                                        </div>
                                    </div>
                                </div>

                            </Col>
                            */}
                            {/* {status ?
                                rows && Object.keys(rows).map((key, i) => (
                                    <Col key={key}>
                                        <div className="card card-span shadow py-4 border-top border-4 border-primary">
                                            <div className="card-body">
                                                <h6 color="green">
                                                    {
                                                        plans && status && new Date(startDate).getTime() > new Date(plans[0].sub_end_date).getTime() && rows[i].plan == plans[0].plan
                                                            ?
                                                            `Your current plan has been expired please subscribe any
                                            plan`
                                                            :
                                                            plans && status && rows[i].plan == plans[0].plan && `Your subscription plan will be expire on ${new Date(plans[0].sub_end_date).toISOString().slice(0, 19).replace('T', ' ')
                                                            }`
                                                    }
                                                </h6>
                                                <div className="text-center"><img
                                                    src="assets/img/icons/shared-hosting.png" alt="..."
                                                    style={{ paddingLeft: "22px" }} />    <h5 className="my-3">{rows[i].plan}</h5>
                                                    <ul className="list-unstyled">
                                                        <li>{`${rows[i].description_1}`}</li>
                                                        <li>{`${rows[i].description_2}`}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="border-top bg-white text-center pt-3 pb-0">
                                                <p className="mb-0">Get started at </p>
                                                <div className="d-flex justify-content-center">
                                                    <h3 className="fw-normal">{`${rows[i].plan_price == 0 ? 'Free' : rows[i].plan_price + '$/month'}`}</h3>
                                                </div>
                                                <div className="d-flex justify-content-center">
                                                    {status && plans && rows[i].plan != plans[0].plan ?
                                                        <a className="btn btn-primary" href="/signin" role="button"
                                                            color="blue"
                                                        >{`${rows[i].button_text}`}</a>
                                                        :
                                                        status && plans && new Date(startDate).getTime() > new Date(plans[0].sub_end_date).getTime() && rows[i].plan == plans[0].plan && <a className="btn btn-primary" href="/dashboard" role="button"
                                                            color="blue"
                                                        >{`${rows[i].button_text}`}</a>
                                                    }
                                                    {status && plans == null &&
                                                        <a className="btn btn-primary" href="/signin" role="button"
                                                            color="blue"
                                                        >{`${rows[i].button_text}`}</a>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </Col>

                                ))
                                :
                                <div>
                                    <center>
                                        <CircularProgress />
                                    </center>
                                </div>
                            } */}
                        </Row>
                    </div>

                </Section>
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
                                            <Form.Control type="email" placeholder="name@example.com" />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                            <Form.Control as="textarea" rows={3}
                                                style={{ width: "500px" }}
                                                placeholder="enter some content">
                                            </Form.Control>
                                        </Form.Group>
                                    </li>
                                    <li>
                                        <Button color="primary" variant="contained" type="submit">
                                            <Icon>send</Icon>
                                            <span className="pl-2 capitalize">Submit</span>
                                        </Button>
                                    </li>
                                </ul>
                            </Col>
                            <Col className="col-md-8 col-xl-4 mb-3" style={{ marginTop: "31px" }}>
                                <ul className="list-unstyled">
                                    <li className="lh-lg" style={{ listStyleType: "disc", color: "#fff", fontSize: "16px" }}>
                                        <a href="https://app.websitepolicies.com/policies/view/5sj5k6sy">Desclaimer</a>
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
                    </Container>
                </Section>
            </main>
        </ScrollingProvider >
    )
}

export default Home;
