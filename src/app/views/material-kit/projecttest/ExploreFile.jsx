import React, { useState, useEffect } from "react";
import { Row, Container, Col } from "react-bootstrap";
import { Breadcrumb } from 'app/components'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent';
import styles from './Trace.css'
import TextField from '@material-ui/core/TextField'
import { Button } from "@material-ui/core";
import moment from "moment";
import Web3 from "web3";
import { API_URL } from "ServerConfig";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS } from 'ServerConfig';

const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));
let wallet;
// let fileDetails;
export default function ExploreFile() {
    const [did, setDID] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [originator, setOriginator] = useState(null);
    const [owner, setOwner] = useState(null);
    const [uploadTime, setUploadTime] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(false)
    const [fileDetails, setFileDetails] = useState([]);
    useEffect(() => {
        try {
            const data = JSON.parse(localStorage.getItem("did_data"));
            wallet = data.wallet;
            console.log("resdid",fileDetails)
        } catch (e) {
            console.log(e)
        }
    })

    function handleChange(e) {
        setDID(e.target.value)
    }
    function handleSnackbarClose() {
        setError(null)
        setSuccess(null)
    }
    function clearData() {
        setDID("")
        setOriginator(null);
        setOwner(null);
        setFileDetails(null)
        setUploadTime(null);
    }
    async function showData() {
        setLoading(true)
        if (did) {
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                from: wallet.walletaddress,
                gasLimit: "0x200b20",
            });
            await contract.methods.getAllTracibilityLogs(did).call({
                from: wallet.walletaddress
            })
                .then(async (res) => {
                    if (res == null || res == undefined || res == "") {
                        setLoading(false)
                        setError("please enter valid DID")
                    }
                    for (let i = 0; i < res.length; i++) {
                        await contract.methods.getFileMetaData(res[i]).call({
                            from: wallet.walletaddress
                        })

                            .then((data) => {


                                if (data[0] != "") {
                                    const fileId = atob(did);
                                    setOriginator(fileId.split("_")[2])
                                    // console.log("track3", data)
                                    setOwner(data.uploadedBy);
                                    setUploadTime(new Date(data.uploadTime * 1000).toLocaleString('en-GB'))
                                    setLoading(false)
                                }
                            }).catch((e) => {
                                setLoading(false)
                                setError("something went wrong")
                            })
                    }
                })
            const opts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "fileId": did
                }),
            }
            const response = await fetch(`${API_URL}/getallsharedfiles`, opts);
            await response.json()
                .then((res) => {
                    const key = 'time';
                    setFileDetails([...new Map(res.data.map(item =>
                        [item[key], item])).values()])
                    // setFileDetails(res.data)
                    setStatus(true)
                })


        } else {
            setError("please enter DID")
            setLoading(false)
        }
    }
    // console.log("resdid", fileDetails[0].from)
    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Track and Trace documents' },
                    ]}
                />
            </div>
            <center>
                <h2>
                    <b>
                        Track and Trace documentsDID
                    </b>
                </h2>
            </center>
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
                onClose={handleSnackbarClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleSnackbarClose}
                    variant="error"
                    message={error}
                />
            </Snackbar>

            <Container className="justify-content-center">
                <Row className="pt-4">
                    <Col>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="did"
                            label="Enter DID"
                            type="text"
                            name="did"
                            fullWidth
                            variant="outlined"
                            value={did}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <center>
                            <Button
                                className="capitalize"
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={loading}
                                onClick={showData}
                            >
                                {"Show"}
                            </Button>
                            {"  "}
                            <Button
                                className="capitalize"
                                variant="contained"
                                color="primary"
                                type="submit"
                                onClick={clearData}
                            >
                                {"Clear"}
                            </Button>
                        </center>
                    </Col>
                </Row>
                <br /><br />
                <Row>
                    <Col>
                        {originator != null &&
                            <center>
                                <table>
                                    <tr>
                                        <th>
                                            <h2>Issuer</h2>
                                        </th>
                                        <td>
                                            <h3>{`\t\t:\t\t${originator}`}</h3>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>
                                            <h2>Owner</h2>
                                        </th>
                                        <td>
                                            <h3>{`\t\t:\t\t${owner}`}</h3>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>
                                            <h2>UploadTime</h2>
                                        </th>
                                        <td>
                                            <h3>{`\t\t:\t\t${uploadTime}`}</h3>
                                        </td>
                                    </tr>
                                </table>
                            </center>
                        }
                    </Col>
                </Row>
            </Container>
            {status && fileDetails && Object.keys(fileDetails).map((row, i) => (
                (() => {
                    if (fileDetails[i].from.length == 42 && fileDetails[i].to.length == 42) {
                        return (
                            // console.log("length",fileDetails[i].from,fileDetails[i].to)
                            <center className="borderadd">
                                <div className="events">

                                    <li>
                                        <time datetime="From">Transfer From</time>
                                        <span><strong>{fileDetails[i].from}</strong> </span>
                                    </li>
                                    <li>
                                        <time datetime="Shared To">Transfer To</time>
                                        <span><strong>{fileDetails[i].to}</strong></span>
                                    </li>
                                    <li>
                                        <time datetime="Shared Date">Transfer Date</time>
                                        <span><strong>{fileDetails[i].created_date}</strong></span>
                                    </li>

                                </div>
                            </center>
                        )

                    }
                    else{
                        return (
                            // console.log("length",fileDetails[i].from)
                            <center className="borderadd">
                                <div className="events">

                                    <li>
                                        <time datetime="From">Share From</time>
                                        <span><strong>{fileDetails[i].from}</strong> </span>
                                    </li>
                                    <li>
                                        <time datetime="Shared To">Share To</time>
                                        <span><strong>{fileDetails[i].to}</strong></span>
                                    </li>
                                    <li>
                                        <time datetime="Shared Date">Share Date</time>
                                        <span><strong>{fileDetails[i].created_date}</strong></span>
                                    </li>

                                </div>
                            </center>
                        )
                    }
                    
                })()


            ))}


        </div>
    );
}