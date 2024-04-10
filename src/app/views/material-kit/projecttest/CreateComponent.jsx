import React, { useState } from 'react'
import Web3 from 'web3'
import {
    INFURA_URL,
    CONTRACT_ABI,
    CONTRACT_ADDRESS,
    API_URL,
    TRANSFER_WARNING,
} from 'ServerConfig'
import { makeStyles } from '@material-ui/core/styles'
import { Icon, Button } from '@material-ui/core'
import { Breadcrumb, SimpleCard } from 'app/components'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import {
    Grid
} from '@material-ui/core';
import { Folder } from '@material-ui/icons'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent';
// import { Link } from '@material-ui/core'
import {
    StoreProjects, StoreBusinessProjects, getAllDIDData,
    StoreInvoicingProjects, getDID, StoreWOTProjects,
    StoreEBOLProject, StoreELCProject
} from './StoreDataDid'
import { CircularProgress } from '@material-ui/core'
import { useEffect } from 'react'
import PasswordPopup from 'app/components/MatxLayout/Layout1/PasswordPopup';
import crypt from "crypto-js";
import { Redirect } from 'react-router-dom'
import TransferredFiles from './TransferredFiles'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
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
let wallet;
let data;
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL))
let allProject = [];
let fileStatus = [];
export default function CreateComponent(props) {
    // console.log("props",props)
    if (props.data == null) {
    } else {
        data = props.data;
    }
    const business = props.business;
    const invoicing = props.invoicing;
    const wot = props.wot;
    const ebol = props.ebol;
    const elc = props.elc;
    const classes = useStyles()
    const handleChange = (event) => {
        setProject(event.target.value)
    }
    const [project, setProject] = useState(null)
    const [redirect, setRedirect] = useState(false)
    const [upload, setUpload] = useState(null)
    const [success, setSuccess] = useState(null)
    const [error, setError] = useState(null)
    const [progress, setProgress] = useState(false)
    const [open, setOpen] = useState(false)
    const [fetchProject, setFetchProject] = useState(false)
    const [sync, setSync] = useState(false)
    const [transferFileStatus, setTransferFileStatus] = useState(false)
    const [transferData, setTransferData] = useState(null)
    const [checkData, setCheckData] = useState(false)
    if (props.transfer && Object.keys(props.transfer).length > 0 && transferData == null) {
        // console.log("props", props.transfer)
        setTransferFileStatus(true)
        setTransferData(props.transfer);
    }

    useEffect(() => {
        (async () => {
            const data = JSON.parse(localStorage.getItem('did_data'))
            wallet = data.wallet
            try {
                const contract = new web3.eth.Contract(
                    CONTRACT_ABI,
                    CONTRACT_ADDRESS,
                    {
                        from: wallet.walletaddress,
                        gasLimit: '0x200b20',
                    }
                )
                const hash = await contract.methods
                    .getAllFilesUploadedByUser(wallet.walletaddress)
                    .call({
                        from: wallet.walletaddress,
                    })
                for (let i = 0; i < hash.length; i++) {
                    const status = await contract.methods
                        .getFileStatus(hash[i])
                        .call({
                            from: wallet.walletaddress,
                        })
                    fileStatus.push(status)
                }
                for(let i = 0; i < fileStatus.length; i++){
                    // console.log("filestatus",fileStatus[i])
                    if(fileStatus[i] == ""){
                        setCheckData(true)
                    }
                }
                
            }
            catch (e) {
                console.log(e)
            }
        })()
    })

    useEffect(() => {
        (async () => {
            try {
                const res = await getDID();
                if (res == false) {
                    setSync(true);
                } else {
                    setSync(false)
                }
                
            } catch (e) {
                console.log(e)
            }
        })()
    },[])

    
    

    const handleSubmit = async (event) => {
        if (sync) {
            setError("please sync your wallet first")
        } else
            createProject();
    }
    async function createProject() {

        try {
            // const password = document.getElementById("file-password").value;
            setProgress(true)
            if (localStorage.getItem("did_data") === null
                || localStorage.getItem("did_data") === "empty"
                || localStorage.getItem("did_data") === "undefined"
                || localStorage.getItem("did_data") === undefined) {
                setProgress(false)
                await getAllDIDData();
                setError("please create wallet first !")
            } else {
                const allData = JSON.parse(localStorage.getItem("did_data"));
                if (allData.wallet === null || allData.wallet === undefined || allData === "empty") {
                    setError("please create wallet first !")
                    setProgress(false)
                } else {
                    if ((allData.project != undefined && allData.project[project.toLowerCase()] == project.toLowerCase()) ||
                        (allData.business != undefined && allData.business[project.toLowerCase()] == project.toLowerCase()) ||
                        (allData.invoicing != undefined && allData.invoicing[project.toLowerCase()] == project.toLowerCase())) {
                        setProgress(false)
                        setError("Project already exist !");
                    } else {
                        // const decPrivate = crypt.AES.decrypt(allData.wallet.privatekey, password).toString(crypt.enc.Utf8);
                        // if (decPrivate.length <= 0) {
                        //     setError("your password may be wrong")
                        // } else {
                        setOpen(false);
                        let status;
                        if (business === "" && invoicing === "" && wot === "" && elc === "" && ebol === "") {
                            status = await StoreProjects(project, allData.wallet.walletaddress)
                        }
                        else if (business !== "") {
                            status = await StoreBusinessProjects(project, allData.wallet.walletaddress)
                        }
                        else if (invoicing !== "") {
                            status = await StoreInvoicingProjects(project, allData.wallet.walletaddress)
                        }
                        else if (wot !== "") {
                            status = await StoreWOTProjects(project, allData.wallet.walletaddress)
                        }
                        else if (ebol !== "") {
                            status = await StoreEBOLProject(project, allData.wallet.walletaddress)
                        }
                        else if (elc !== "") {
                            status = await StoreELCProject(project, allData.wallet.walletaddress)
                        }
                        setProgress(false)
                        allProject.push(project)
                        setSuccess("Project created successfully");
                        setFetchProject(true)
                        setTimeout(function () {
                            localStorage.setItem("proStatus", true)
                            setFetchProject(false)
                        }, 100)
                    }
                    // }
                }
                await getAllDIDData();
            }
        } catch (e) {
            setProgress(false)
            setError("Something went wrong")
            console.log(e)
        }

    }
    const handleSnackbarClose = () => {
        setSuccess(null);
        setError(null)
    }
    function handleOpen() {
        setOpen(!open)
    }
    // console.log("traaa",transferData)
    // console.log("filestatus", fileStatus)
    // console.log("sandeep",checkData)
    
    return (
        <div>
            {/* <PasswordPopup status={open} close={handleOpen} submit={createProject} /> */}
            {upload != null ? ""
                // <UploadFile
                //     projectname={upload}></UploadFile>
                :
                <div>
                    <div className="mb-sm-30">
                        {
                            business ?
                                <Breadcrumb
                                    routeSegments={[
                                        { name: business },
                                    ]}
                                />
                                :
                                invoicing ?
                                    <Breadcrumb
                                        routeSegments={[
                                            { name: invoicing },
                                        ]}
                                    />
                                    :
                                    wot ?
                                        <Breadcrumb
                                            routeSegments={[
                                                { name: wot },
                                            ]}

                                        />
                                        :
                                        ebol ?
                                            <Breadcrumb
                                                routeSegments={[
                                                    { name: ebol },
                                                ]}

                                            />
                                            :
                                            elc ?
                                                <Breadcrumb
                                                    routeSegments={[
                                                        { name: wot },
                                                    ]}

                                                />
                                                :
                                                <Breadcrumb
                                                    routeSegments={[
                                                        { name: "Create Project/file Folder" },
                                                    ]}
                                                />
                        }
                    </div>
                    <SimpleCard title="Create Project/file Folder">
                        <Snackbar
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            open={success != null}
                            autoHideDuration={2000}
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
                            autoHideDuration={2000}
                            onClose={handleSnackbarClose}
                        >
                            <MySnackbarContentWrapper
                                onClose={handleSnackbarClose}
                                variant="error"
                                message={error}
                            />
                        </Snackbar>
                        <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                            <TextValidator
                                className="mb-4 w-full"
                                label="Project name (Min length 3, Max length 25)"
                                onChange={handleChange}
                                type="text"
                                name="projectname"
                                value={project || ''}
                                validators={[
                                    'required',
                                    'minStringLength: 3',
                                    'maxStringLength: 25',
                                ]}
                                errorMessages={['project name is required']}
                            />
                            <Button color="primary" variant="contained" type="submit" disabled={progress}>
                                <Icon>add</Icon>
                                <span className="pl-2 capitalize">create</span>
                            </Button>
                        </ValidatorForm>
                        <br />
                        {progress &&
                            <div>
                                <center>
                                    <CircularProgress className={classes.progress} />
                                </center>
                            </div>
                        }
                        <h3>All projects</h3>
                        {
                            business === "" && invoicing === "" && wot === "" && ebol === "" && elc === "" && !fetchProject &&
                            <Grid container spacing={2}>
                                {data != null && data.project && Object.keys(data.project).map((key, i) => (
                                    <Grid item md={2} key={i}>
                                        <div>
                                            <Link to={`/upload/${key}`}>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => setUpload(key)}
                                                >
                                                    <Folder></Folder>
                                                    {key.length > 6 ?
                                                        <span className={classes.folder}>{`${key.substring(0, 6)}...`}</span>
                                                        :
                                                        <span className={classes.folder}>{key}</span>
                                                    }
                                                </Button>
                                            </Link>
                                        </div>
                                    </Grid>
                                ))}
                                {
                                    fetchProject ?
                                        <div>
                                            <center>
                                                <CircularProgress className={classes.progress} />
                                            </center>
                                        </div>
                                        :
                                        localStorage.getItem("proStatus") === "true" &&
                                        allProject.map((rows, i) => (
                                            <Grid item md={2}>
                                                <div>
                                                    <Link to={`/upload/${allProject[i]}`}>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => setUpload(allProject[i])}
                                                        >
                                                            <Folder></Folder>
                                                            {allProject[i].length > 6 ?
                                                                <span className={classes.folder}>{`${allProject[i].substring(0, 6)}...`}</span>
                                                                :
                                                                <span className={classes.folder}>{allProject[i]}</span>
                                                            }
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </Grid>
                                        ))
                                }
                            </Grid>
                        }
                        {
                            business != "" && invoicing === "" && wot === "" && ebol === "" && elc === "" && !fetchProject &&
                            <Grid container spacing={2}>
                                {data != null && data.business && Object.keys(data.business).map((key, i) => (
                                    <Grid item md={2} key={i}>
                                        <div>
                                            <Link to={`/xmldocupload/${key}`}>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => setUpload(key)}
                                                >
                                                    <Folder></Folder>
                                                    {key.length > 6 ?
                                                        <span className={classes.folder}>{`${key.substring(0, 6)}...`}</span>
                                                        :
                                                        <span className={classes.folder}>{key}</span>
                                                    }
                                                </Button>
                                            </Link>
                                        </div>
                                    </Grid>
                                ))}
                                {
                                    fetchProject ?
                                        <div>
                                            <center>
                                                <CircularProgress className={classes.progress} />
                                            </center>
                                        </div>
                                        :
                                        localStorage.getItem("proStatus") === "true" &&
                                        allProject.map((rows, i) => (
                                            <Grid item md={2}>
                                                <div>
                                                    <Link to={`/xmldocupload/${allProject[i]}`}>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => setUpload(allProject[i])}
                                                        >
                                                            <Folder></Folder>
                                                            {allProject[i].length > 6 ?
                                                                <span className={classes.folder}>{`${allProject[i].substring(0, 6)}...`}</span>
                                                                :
                                                                <span className={classes.folder}>{allProject[i]}</span>
                                                            }
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </Grid>
                                        ))
                                }
                            </Grid>
                        }
                        {
                            invoicing != "" && !fetchProject &&
                            <Grid container spacing={2}>
                                {data != null && data.invoicing && Object.keys(data.invoicing).map((key, i) => (
                                    <Grid item md={2} key={i}>
                                        <div>
                                            <Link to={`/einvoicingupload/${key}`}>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => setUpload(key)}
                                                >
                                                    <Folder></Folder>
                                                    {key.length > 6 ?
                                                        <span className={classes.folder}>{`${key.substring(0, 6)}...`}</span>
                                                        :
                                                        <span className={classes.folder}>{key}</span>
                                                    }
                                                </Button>
                                            </Link>
                                        </div>
                                    </Grid>
                                ))}
                                {
                                    fetchProject ?
                                        <div>
                                            <center>
                                                <CircularProgress className={classes.progress} />
                                            </center>
                                        </div>
                                        :
                                        localStorage.getItem("proStatus") === "true" &&
                                        allProject.map((rows, i) => (
                                            <Grid item md={2}>
                                                <div>
                                                    <Link to={`/einvoicingupload/${allProject[i]}`}>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => setUpload(allProject[i])}
                                                        >
                                                            <Folder></Folder>
                                                            {allProject[i].length > 6 ?
                                                                <span className={classes.folder}>{`${allProject[i].substring(0, 6)}...`}</span>
                                                                :
                                                                <span className={classes.folder}>{allProject[i]}</span>
                                                            }
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </Grid>
                                        ))
                                }
                            </Grid>

                        }
                        {
                            wot != "" && !fetchProject &&
                            <Grid container spacing={2}>
                                {data != null && data.wot && Object.keys(data.wot).map((key, i) => (
                                    <Grid item md={2} key={i}>
                                        <div>
                                            <Link to={`/wot-upload/${key}`}>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => setUpload(key)}
                                                >
                                                    <Folder></Folder>
                                                    {key.length > 6 ?
                                                        <span className={classes.folder}>{`${key.substring(0, 6)}...`}</span>
                                                        :
                                                        <span className={classes.folder}>{key}</span>
                                                    }
                                                </Button>
                                            </Link>
                                        </div>
                                    </Grid>
                                ))}
                                {
                                    fetchProject ?
                                        <div>
                                            <center>
                                                <CircularProgress className={classes.progress} />
                                            </center>
                                        </div>
                                        :
                                        localStorage.getItem("proStatus") === "true" &&
                                        allProject.map((rows, i) => (
                                            <Grid item md={2}>
                                                <div>
                                                    <Link to={`/wot-upload/${allProject[i]}`}>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => setUpload(allProject[i])}
                                                        >
                                                            <Folder></Folder>
                                                            {allProject[i].length > 6 ?
                                                                <span className={classes.folder}>{`${allProject[i].substring(0, 6)}...`}</span>
                                                                :
                                                                <span className={classes.folder}>{allProject[i]}</span>
                                                            }
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </Grid>
                                        ))
                                }
                            </Grid>
                        }
                        {
                            ebol != "" && !fetchProject &&
                            <Grid container spacing={2}>
                                {data != null && data.ebol && Object.keys(data.ebol).map((key, i) => (
                                    <Grid item md={2} key={i}>
                                        <div>
                                            <Link to={`/ebol-upload/${key}`}>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => setUpload(key)}
                                                >
                                                    <Folder></Folder>
                                                    {key.length > 6 ?
                                                        <span className={classes.folder}>{`${key.substring(0, 6)}...`}</span>
                                                        :
                                                        <span className={classes.folder}>{key}</span>
                                                    }
                                                </Button>
                                            </Link>
                                        </div>
                                    </Grid>
                                ))}
                                {
                                    fetchProject ?
                                        <div>
                                            <center>
                                                <CircularProgress className={classes.progress} />
                                            </center>
                                        </div>
                                        :
                                        localStorage.getItem("proStatus") === "true" &&
                                        allProject.map((rows, i) => (
                                            <Grid item md={2}>
                                                <div>
                                                    <Link to={`/ebol-upload/${allProject[i]}`}>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => setUpload(allProject[i])}
                                                        >
                                                            <Folder></Folder>
                                                            {allProject[i].length > 6 ?
                                                                <span className={classes.folder}>{`${allProject[i].substring(0, 6)}...`}</span>
                                                                :
                                                                <span className={classes.folder}>{allProject[i]}</span>
                                                            }
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </Grid>
                                        ))
                                }
                            </Grid>
                        }
                        {
                            elc != "" && !fetchProject &&
                            <Grid container spacing={2}>
                                {data != null && data.elc && Object.keys(data.elc).map((key, i) => (
                                    <Grid item md={2} key={i}>
                                        <div>
                                            <Link to={`/elc-upload/${key}`}>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => setUpload(key)}
                                                >
                                                    <Folder></Folder>
                                                    {key.length > 6 ?
                                                        <span className={classes.folder}>{`${key.substring(0, 6)}...`}</span>
                                                        :
                                                        <span className={classes.folder}>{key}</span>
                                                    }
                                                </Button>
                                            </Link>
                                        </div>
                                    </Grid>
                                ))}
                                {
                                    fetchProject ?
                                        <div>
                                            <center>
                                                <CircularProgress className={classes.progress} />
                                            </center>
                                        </div>
                                        :
                                        localStorage.getItem("proStatus") === "true" &&
                                        allProject.map((rows, i) => (
                                            <Grid item md={2}>
                                                <div>
                                                    <Link to={`/elc-upload/${allProject[i]}`}>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => setUpload(allProject[i])}
                                                        >
                                                            <Folder></Folder>
                                                            {allProject[i].length > 6 ?
                                                                <span className={classes.folder}>{`${allProject[i].substring(0, 6)}...`}</span>
                                                                :
                                                                <span className={classes.folder}>{allProject[i]}</span>
                                                            }
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </Grid>
                                        ))
                                }
                            </Grid>
                        }

                        <hr></hr>
                        {
                                    transferFileStatus && checkData && (
                                        <>
                                            <h3>Transferred Files</h3>
                                            <Grid item md={2} key={"tfile"}>
                                                <div>
                                                    <Link to={{
                                                        pathname: "/transfer",
                                                        state: transferData // your data array of objects
                                                    }}>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                        >
                                                            <Folder></Folder>
                                                            {"Transferred"}
                                                        </Button>

                                                    </Link>
                                                    {/* <Link to="/transfer">
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                            >
                                                <Folder></Folder>
                                                {"Transferred"}
                                            </Button>
                                        </Link> */}

                                                </div>
                                            </Grid>
                                        </>
                                    )
                            
                        }
                    </SimpleCard>
                </div>
            }
        </div >
    )
}
