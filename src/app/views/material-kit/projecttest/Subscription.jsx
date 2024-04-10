import React, { useEffect } from 'react'
import { Row, Col } from 'react-bootstrap';
import { Breadcrumb } from 'app/components';
import { API_URL, Publishable_Key } from 'ServerConfig';
import { useState } from 'react';
import { CircularProgress } from '@material-ui/core';
import StripeCheckOut from 'react-stripe-checkout';
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from "./SnackbarComponent";

let rows;
let plans;
let startDate;

export default function Subscription(props) {
    const [status, setStatus] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        try {
            (async () => {
                var date_ob = new Date();
                var day = ("0" + date_ob.getDate()).slice(-2);
                var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                var year = date_ob.getFullYear();
                var hours = date_ob.getHours();
                var minutes = date_ob.getMinutes();
                var seconds = date_ob.getSeconds();
                startDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "email": localStorage.getItem("userEmail")
                    })
                }

                /**
                 * api to fetch all plans for user,
                 * which is provided by admin
                 */
                const response = await fetch(`${API_URL}/fetchplans`, opts);

                /**
                 * api to fetch current user plan which is, 
                 * subscribed by user
                 */
                const subscribedPlan = await fetch(`${API_URL}/getsubscriptionstatus`, opts);
                subscribedPlan.json()
                    .then((res) => {
                        console.log(res)
                        plans = JSON.parse(res.result);
                        var date_ob = new Date();
                        var day = ("0" + date_ob.getDate()).slice(-2);
                        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                        var year = date_ob.getFullYear();
                        var hours = date_ob.getHours();
                        var minutes = date_ob.getMinutes();
                        var seconds = date_ob.getSeconds();
                        const startDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                        if (Object.keys(plans).length === 0) {
                            plans = "sandbox";
                            subscribePlan(0, "", "sandbox", 1);
                        } else if (new Date(startDate).getTime() > new Date(plans[0].sub_end_date).getTime()) {
                            localStorage.setItem("subscription", "notsubscribed");
                            setError("your current plan has been expired subscribe with new plan")
                            // localStorage.setItem("idx_id", "empty");
                        }
                    })
                response.json()
                    .then((res) => {
                        rows = JSON.parse(res.result)
                        // console.log("rows",rows)
                    })
            })()
        } catch (e) {
            console.log(e)
        }
    }, []);

    /**
     * subscribePlan() will call when user,
     * click on subscribe button
     */
    const subscribePlan = async (price, token, plan, id) => {
        try {
            const opts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "amount": price,
                    "email": localStorage.getItem("userEmail"),
                    "plan": plan,
                    "id": id
                }),
            }
            await fetch(
                `${API_URL}/savepaymentdata`,
                opts
            );
            window.location.reload();
        }
        catch (e) {
            console.log(e)
        }
    }
    function handleErrorClose() {
        setError(null)
    }
    setTimeout(function () {
        try {
            setStatus(true)
        } catch (e) {
            console.log(e)
        }
    }, 3000)

    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Subscription' },
                    ]}
                />
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-lg-6 col-xxl-5 text-center mx-auto mb-5">
                        <h2>Types of plans that we provide</h2>
                        <p className="mb-5">Our service is always affordable for everyone. </p>
                    </div>
                </div>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={error != null}
                    autoHideDuration={5000}
                    onClose={handleErrorClose}
                >
                    <MySnackbarContentWrapper
                        onClose={handleErrorClose}
                        variant="error"
                        message={error}
                    />
                </Snackbar>
                <Row>
                    {status ?
                        rows && Object.keys(rows).map((key, i) => (
                            <Col>
                                <div className="card card-span shadow py-4 border-top border-4 border-primary">
                                    <div className="card-body">
                                        <h6 color="green">
                                            {
                                                plans && status && new Date(startDate).getTime() > new Date(plans[0].sub_end_date).getTime() && rows[i].plan === plans[0].plan
                                                    ?
                                                    `Your current plan has been expired please subscribe any
                                            plan`
                                                    :
                                                    plans && status && rows[i].plan === plans[0].plan && `Your subscription plan will be expire on ${new Date(plans[0].sub_end_date).toISOString().slice(0, 19).replace('T', ' ')
                                                    }`
                                            }
                                        </h6>
                                        <div className="text-center"><img
                                            src="assets/img/icons/shared-hosting.png" alt="..."
                                            style={{ paddingLeft: "22px" }} />
                                            <h5 className="my-3">{rows[i].plan}</h5>
                                            <ul className="list-unstyled">
                                                <li>{`${rows[i].description_1}`}</li>
                                                <li>{`${rows[i].description_2}`}</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="border-top bg-white text-center pt-3 pb-0">
                                        <p className="mb-0">Get started at </p>
                                        <div className="d-flex justify-content-center">
                                            <h3 className="fw-normal">{`${rows[i].plan_price === 0 ? 'Free' : '$'+rows[i].plan_price + '/month'}`}</h3>
                                        </div>
                                        <div className="d-flex justify-content-center">
                                            {status && plans && rows[i].plan !== plans[0].plan
                                                && rows[i].plan !== "sandbox" ?
                                                <StripeCheckOut
                                                    description={`${rows[i].description_1}
                                                    ${rows[i].description_2}`}
                                                    stripeKey={Publishable_Key}
                                                    token={(token) => subscribePlan(rows[i].plan_price * 100, token, rows[i].plan, rows[i].id)}
                                                    name={rows[i].plan}
                                                    amount={rows[i].plan_price * 100}
                                                    allowRememberMe
                                                    ComponentClass="div"
                                                >
                                                    <a className="btn btn-primary" role="button"
                                                        color="blue"
                                                    >{`${rows[i].button_text}`}</a>
                                                </StripeCheckOut>
                                                :
                                                status && plans && new Date(startDate).getTime() > new Date(plans[0].sub_end_date).getTime()
                                                && rows[i].plan == plans[0].plan && rows[i].plan != "sandbox" &&
                                                <StripeCheckOut
                                                    description={`${rows[i].description_1}
                                                    ${rows[i].description_2}`}
                                                    stripeKey={Publishable_Key}
                                                    token={(token) => subscribePlan(rows[i].plan_price * 100, token, rows[i].plan, rows[i].id)}
                                                    name={rows[i].plan}
                                                    amount={rows[i].plan_price * 100}
                                                    allowRememberMe
                                                    ComponentClass="div"
                                                >
                                                    <a className="btn btn-primary" role="button"
                                                        color="blue"
                                                    >{`${rows[i].button_text}`}</a>
                                                </StripeCheckOut>
                                            }
                                            {status && plans == null && rows[i].plan != "sandbox" &&
                                                <StripeCheckOut
                                                    description={`${rows[i].description_1}
                                                    ${rows[i].description_2}`}
                                                    stripeKey={Publishable_Key}
                                                    token={(token) => subscribePlan(rows[i].plan_price * 100, token, rows[i].plan, rows[i].id)}
                                                    name={rows[i].plan}
                                                    amount={rows[i].plan_price * 100}
                                                    allowRememberMe
                                                    ComponentClass="div"
                                                >
                                                    <a className="btn btn-primary" role="button"
                                                        color="blue"
                                                    >{`${rows[i].button_text}`}</a>
                                                </StripeCheckOut>
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
                    }
                </Row>
            </div>
        </div >
    );
}