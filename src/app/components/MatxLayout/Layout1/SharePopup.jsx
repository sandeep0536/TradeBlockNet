import React from "react";
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import {
    Grid,
    Button,
} from '@material-ui/core'
import { useEffect } from "react";
import { Box, InputLabel, MenuItem, FormControl, Select } from "@material-ui/core";
import Web3 from "web3";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS } from "ServerConfig";
import { Link } from "@material-ui/core";
let normalProjects;
let ediProjects;
let invoiceProjects;
let wallet;
let rows = [];

const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));
export default function SharePopup(props) {
    const [fileType, setFileType] = React.useState('');
    const [project, setProject] = React.useState('');
    const [selectFile, setSelectFile] = React.useState('');
    const [uploadLink, setUploadLink] = React.useState('');
    const [status, setStatus] = React.useState(false);
    const handleChange = (event) => {
        setProject(event.target.value);
        // getFiles(event.target.value)
    };
    const handleTypeChange = (event) => {
        if (event.target.value == "normal")
            setUploadLink("upload")
        else if (event.target.value == "edi")
            setUploadLink("xmldocupload")
        else if (event.target.value == "invoice")
            setUploadLink("einvoicingupload")
        setFileType(event.target.value);
    };
    const handleFileChange = (event) => {
        setSelectFile(event.target.value);
    };
    useEffect(() => {
        try {
            const data = JSON.parse(localStorage.getItem("did_data"));
            wallet = data.wallet;
            normalProjects = data.project;
            ediProjects = data.business;
            invoiceProjects = data.invoicing;
        } catch (e) { }
    })
    const getFiles = async (project) => {
        try {
            const filehash = JSON.parse(localStorage.getItem("did_data"));
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                from: wallet.walletaddress,
                gasLimit: "0x200b20",
            });
            if (filehash && filehash.files[project]) {
                Object.keys(filehash.files[project]).map(async (key, i) => {
                    const hash = filehash.files[project][key];
                    const metaData = await contract.methods.getFileMetaData(hash).call({
                        from: wallet.walletaddress,
                    })
                        .then((res) => {
                            rows.push(res);
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
                setTimeout(function () {
                    setStatus(true)
                }, 6000)
            }
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <Dialog
            open={true}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title" >Share file</DialogTitle>

            <DialogContent style={{ minWidth: "300px" }}>
                <Box sx={{ minWidth: 420 }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label-type">Select Type</InputLabel>
                        <Select
                            labelId="demo-simple-select-label-type"
                            id="demo-simple-select-type"
                            value={fileType}
                            label="Select Type"
                            fullWidth
                            onChange={handleTypeChange}
                        >
                            <MenuItem value={"normal"}>Normal files</MenuItem>
                            <MenuItem value={"edi"}>Edi files</MenuItem>
                            <MenuItem value={"invoice"}>Invoicing files</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ minWidth: 420 }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label-project">Select Project</InputLabel>
                        <Select
                            labelId="demo-simple-select-label-project"
                            id="demo-simple-select-project"
                            value={project}
                            label="Select Project"
                            fullWidth
                            onChange={handleChange}
                        >
                            {
                                fileType == "normal" && normalProjects &&
                                Object.keys(normalProjects).map((key, value) => (
                                    <MenuItem value={normalProjects[key]}>{normalProjects[key]}</MenuItem>
                                ))
                            }
                            {
                                fileType == "edi" && ediProjects &&
                                Object.keys(ediProjects).map((key, value) => (
                                    <MenuItem value={ediProjects[key]}>{ediProjects[key]}</MenuItem>
                                ))
                            }
                            {
                                fileType == "invoice" && invoiceProjects &&
                                Object.keys(invoiceProjects).map((key, value) => (
                                    <MenuItem value={invoiceProjects[key]}>{invoiceProjects[key]}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </Box>
                {/* <Box sx={{ minWidth: 420 }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Select File</InputLabel>
                        <Select
                            labelId="demo-simple-select-label-file"
                            id="demo-simple-select-file"
                            value={selectFile}
                            label="Select File"
                            fullWidth
                            onChange={handleFileChange}
                        >
                            {
                                status &&
                                Object.keys(rows).map((key, i) => (
                                    <MenuItem value={rows[i].fileName}>{rows[i].fileName}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </Box> */}
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={props.close}
                >
                    Cancel
                </Button>
                <Link href={`/${uploadLink}/${project}`}>
                    <Button disabled={project == ""}>
                        Submit
                    </Button>
                </Link>
            </DialogActions>
        </Dialog>

    );
}