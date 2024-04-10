import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CreateComponent from './CreateComponent'
import RecievedFiles from './RecievedFiles'
import { CircularProgress } from '@material-ui/core'
import { getAllDIDData } from './StoreDataDid'
import { API_URL } from 'ServerConfig'
const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
    cardroot: {
        width: "150px !important",
        height: "150px !important",
        backgroundColor: "#F0E68C",
        marginTop: "15px",
        marginLeft: "15px"
    },
    folder: {
        width: "70px",
        fontSize: "12px",
        marginLeft: "10px",
        marginTop: "1px"
    },
    progress: {
        margin: theme.spacing(2),
    },
}))
let jsonData = {};
// let transferData;
export default function CreateProject(props) {
    const [transferData, setTransferData] = useState(null);
    const classes = useStyles()
    useEffect(() => {
        (async () => {
            localStorage.removeItem("proStatus")
            await getAllProjects();
        })();
    }, [jsonData])
    setInterval(function () {
        if (localStorage.getItem("did_data") === "empty") {
            setStatus(true)
        }
    }, 100)
    const getAllProjects = async () => {
        try {
            if (localStorage.getItem("did_data") == null || localStorage.getItem("did_data") == "undefined" || localStorage.getItem("did_data") == undefined) {
                await getAllDIDData()
                    .then((res) => {
                        console.log(res)
                        localStorage.setItem("did_data", res)
                        if (res != null || res != undefined || res != "empty") { }
                        else {
                            setStatus(true)
                        }
                    })
                    .catch((e) => {
                        console.log(e)
                    })

            } else {
                try {
                    const data = JSON.parse(localStorage.getItem("did_data"));
                    const tdata = await getTransferredFiles(data.wallet.walletaddress)
                    if (data.project === null || data.project === undefined) {
                        setStatus(true)
                    } else {
                        jsonData = data;
                        setStatus(true)
                    }
                } catch (e) {
                    console.log(e)
                    setStatus(true)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
    async function getTransferredFiles(address) {
        try {
            const opts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "address": address,
                }),
            }
            const files = await fetch(`${API_URL}/gettransferredfiles`, opts);
            await files.json()
                .then((res) => {
                    if (res.result.status) {
                        if (res.result.data.length > 0) {
                            setTransferData(res.result.data);
                        }
                    }
                }).catch((e) => {
                    console.log(e)
                })
        }
        catch (e) {
            console.log(e)
        }
    }
    const [status, setStatus] = useState(false)


    return (
        <div className="m-sm-30">

            {status && jsonData ?
               <>
                <CreateComponent
                    transfer={transferData}
                    data={jsonData}
                    business={props.data === "B2B" ? "Edi Doc Upload" : ""}
                    invoicing={props.data === "EIN" ? "e-invoicing" : ""}
                    wot={props.data === "WOT" ? "Web of things" : ""}
                    ebol={props.data === "EBOL" ? "e-Bol" : ""}
                    elc={props.data === "ELC" ? "e-LC" : ""}
                />

               </>
                
                :
                <div>
                    <center>
                        <CircularProgress className={classes.progress} />
                    </center>
                </div>
            }
            <div className="py-3" />
        </div >
    )
}
