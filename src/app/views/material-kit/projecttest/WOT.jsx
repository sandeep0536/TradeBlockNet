import React, { useState, useEffect } from 'react';
import CreateProject from './CreateProject';
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent';
import { API_URL } from 'ServerConfig';
import history from 'history.js';
export default function WOT() {
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    function handleSnackbarClose(event, reason) {
        if (reason === 'clickaway') {
            return
        }
        setSuccess(null)
    }
    function handleErrorClose(event, reason) {
        setError(null)
    }
    (async () => {
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": localStorage.getItem("userEmail"),
            }),
        }
        const res = await fetch(`${API_URL}/getsubscriptionstatus`, opts);
        await res.json()
            .then((res) => {
                const data = JSON.parse(res.result);
                var date_ob = new Date();
                var day = ("0" + date_ob.getDate()).slice(-2);
                var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                var year = date_ob.getFullYear();
                var hours = date_ob.getHours();
                var minutes = date_ob.getMinutes();
                var seconds = date_ob.getSeconds();
                const startDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                if (Object.keys(data).length < 1) {
                    history.push("/subscription")
                }
                else if (new Date(startDate).getTime() > new Date(data[0].sub_end_date).getTime()) {
                    history.push("/subscription")
                }
                else if (data[0].plan == "sandbox" || data[0].plan == "bronze" || data[0].plan == "silver") {
                    history.push("/dashboard")
                }
            })
    })();
    return (
        <div className="mb-sm-30">
            <CreateProject
                data="WOT"
            ></CreateProject>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={success != null}
                autoHideDuration={5000}
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
                    vertical: 'bottom',
                    horizontal: 'left',
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
        </div>
    );
}