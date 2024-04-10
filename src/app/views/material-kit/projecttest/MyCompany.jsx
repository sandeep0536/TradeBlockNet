import React, { useState, useEffect } from 'react'
import { Breadcrumb } from 'app/components'
import {
    Box,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    Button,
} from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import { Row, Container, Col } from 'react-bootstrap'
import { API_URL } from 'ServerConfig'
import { Avatar } from '@material-ui/core'
import { storeProfile } from './StoreDataDid'
import { CircularProgress } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent'
import { confirmAlert } from 'react-confirm-alert'
import $ from 'jquery'
import { storeCompanyDetails } from './StoreDataDid'
import PasswordPopup from '../../../components/MatxLayout/Layout1/PasswordPopup'
import crypt from 'crypto-js'
import WaitSnackbar from './filecomponents/WaitSnackbar'
import { Link } from 'react-router-dom'
import history from 'history.js'

let wallet
let profile
let companyProfile
let newValues = {}
let companyData = {}
export default function MyCompany() {
    const [role, setRole] = useState('')
    const [plan, setPlan] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [status, setStatus] = useState('')
    const [planStatus, setPlanStatus] = useState('')
    const [progress, setProgress] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [profileImg, setProfileImg] = useState(null)
    const [open, setOpen] = useState(false)
    const [readOnly, setReadOnly] = useState(false)
    const [update, setUpdate] = useState(false)
    const [data, setData] = useState('')
    const [companyId, setCompanyId] = useState('')
    const [companyAdmin, setCompanyAdmin] = useState(null)
    const [userInfo, setUserInfo] = useState({})
    function handleRole(event) {
        setRole(event.target.value)
    }
    const handleChange = ({ target: { name, value } }) => {
        let temp = { ...userInfo }
        temp[name] = value
        setUserInfo(temp)
        companyData[name] = temp
        newValues = companyData[name]
    }
    function handleClose() {
        setOpen(!open)
    }
    const handleProfileImg = (event) => {
        setImg(event.target)
    }
    // const logo=document.getElementById("company-logo");
    // if(logo&&logo!=undefined){
    //     document.getElementById("company-logo").onclick(function(){
    //     })
    // }
    useEffect(() => {
        try {
            // $('#company-logo').change(function () {
            //     setImg(this)
            // })
            const data = JSON.parse(localStorage.getItem('did_data'))
            wallet = data.wallet
            profile = data.profile
            companyProfile = data.companyProfile
                ; (async () => {
                    try {
                        const opts = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                email: localStorage.getItem('userEmail'),
                            }),
                        }
                        companyData = JSON.parse(
                            companyProfile[localStorage.getItem('userEmail')]
                        )
                        document.getElementById('add1').value = companyData.add1
                        await getValues(companyData)

                        const res = await fetch(
                            `${API_URL}/getsubscriptionstatus`,
                            opts
                        )
                        await res
                            .json()
                            .then((res) => {
                                const data = JSON.parse(res.result)
                                var date_ob = new Date()
                                var day = ('0' + date_ob.getDate()).slice(-2)
                                var month = ('0' + (date_ob.getMonth() + 1)).slice(
                                    -2
                                )
                                var year = date_ob.getFullYear()
                                var hours = date_ob.getHours()
                                var minutes = date_ob.getMinutes()
                                var seconds = date_ob.getSeconds()
                                setExpiryDate(data[0].sub_end_date)
                                setPlan(data[0].plan)
                                const startDate =
                                    year +
                                    '-' +
                                    month +
                                    '-' +
                                    day +
                                    ' ' +
                                    hours +
                                    ':' +
                                    minutes +
                                    ':' +
                                    seconds
                                if (Object.keys(data).length < 1) {
                                    localStorage.setItem('subscription', 'sandbox')
                                } else if (
                                    new Date(startDate).getTime() >
                                    new Date(data[0].sub_end_date).getTime()
                                ) {
                                    localStorage.setItem(
                                        'subscription',
                                        'notsubscribed'
                                    )
                                } else {
                                    localStorage.setItem(
                                        'subscription',
                                        data[0].plan_type
                                    )
                                }
                                setRole('User')
                                setPlanStatus(true)
                            })
                            .catch((e) => {
                                console.log(e)
                            })
                    } catch (e) { }
                })()
        } catch (e) {
            console.log(e)
        }
    }, [companyData])
    async function getValues(companyData) {
        setReadOnly(true)
        setProfileImg(profileImg ? profileImg : companyData.profileImg)
        setData(true)
        setUpdate(true)
    }
    function handleSnackbarClose() {
        setError(null)
        setSuccess(null)
    }

    setTimeout(() => {
        setStatus(true)
    }, 3000)
    // $('#company-logo').attr('src', function () {
    //     setImg(this)
    // })
    // $(document).ready(function () {
    //     $('#company-logo').change(function () {
    //         setImg(this)
    //     })
    // })
    function setImg(input) {

        if (input.files && input.files[0] && input.files[0].size <= 164221) {
            var reader = new FileReader()
            reader.onload = function (e) {
                // console.log('input.files[0]', input.files[0])
                setProfileImg(e.target.result)
            }
            reader.readAsDataURL(input.files[0])
        }
        else {
            setError("please use less than 164 kb file")
        }
    }
    const {
        cname,
        add1,
        add2,
        country,
        state,
        city,
        zip,
        phone,
        email,
        website,
        did,
        vat,
        registration,
        duns,
        eori,
        lei,
        blockchainAddress,
        cpublickey,
        cprivatekey,
    } = userInfo
    async function saveData() {
        try {
            // const password = document.getElementById("file-password").value;
            // const decPrivate = crypt.AES.decrypt(wallet.privatekey, "" + password).toString(crypt.enc.Utf8);
            // if (decPrivate.length > 0) {
            setOpen(false)
            setProgress(true)
            const roles = ['User']
            const companyToken = btoa(
                userInfo.email +
                '__' +
                userInfo.cname +
                '__' +
                wallet.walletaddress
            )
            if (newValues.cname) companyData.cname = newValues.cname
            if (newValues.add1) companyData.add1 = newValues.add1
            if (newValues.add2) companyData.add2 = newValues.add2
            if (newValues.country) companyData.country = newValues.country
            if (newValues.city) companyData.city = newValues.city
            if (newValues.state) companyData.state = newValues.state
            if (newValues.eori) companyData.eori = newValues.eori
            if (newValues.zip) companyData.zip = newValues.zip
            if (newValues.phone) companyData.phone = newValues.phone
            if (newValues.website) companyData.website = newValues.website
            if (newValues.vat) companyData.vat = newValues.vat
            if (newValues.registration)
                companyData.registration = newValues.registration
            if (newValues.duns) companyData.duns = newValues.duns
            if (newValues.lei) companyData.lei = newValues.lei
            await storeCompanyDetails(
                companyData,
                companyToken,
                roles,
                wallet.walletaddress,
                profileImg
            )
                .then((res) => {
                    setProgress(false)
                    setSuccess('Company profile saved successfully!')
                    window.location.reload()
                })
                .catch((e) => {
                    setError('something went wrong')
                })
            // else {
            //     setError("your password may be wrong")
            // }
        } catch (e) {
            setError('something went wrong')
            console.log(e)
        }
    }
    async function upData() {
        try {
            setOpen(false)
            setProgress(true)
            const roles = ['User']
            const companyToken = btoa(
                userInfo.email +
                '__' +
                userInfo.cname +
                '__' +
                wallet.walletaddress
            )
            await storeCompanyDetails(
                companyData,
                companyToken,
                roles,
                wallet.walletaddress,
                profileImg
            )
                .then((res) => {
                    setProgress(false)
                    setSuccess('Company profile saved successfully!')
                    // window.location.reload()x
                })
                .catch((e) => {
                    setError('something went wrong')
                })
            // else {
            //     setError("your password may be wrong")
            // }
        } catch (e) {
            setError('something went wrong')
            console.log(e)
        }
    }
    async function getData() {
        const cname = document.getElementById('cname').value
        const add1 = document.getElementById('add1').value
        const add2 = document.getElementById('add2').value
        const city = document.getElementById('city').value
        const state = document.getElementById('state').value
        const country = document.getElementById('country').value
        const zip = document.getElementById('zip').value
        const phone = document.getElementById('phone').value
        const website = document.getElementById('website').value
        const email = document.getElementById('email').value
        const dunse = document.getElementById('dunse').value
        // console.log(cname,add1,add2)
        if (profileImg == null) setError('please choose profile image')
        else if (!cname || !add1 || !add2 || !city || !state || !country || !zip || !phone || !website || !email || !dunse) {
            setError("Please fill all fields !")
        } else {
            saveData();
        }
        // else if (
        //     console.log(companyData.cname)
        //     (!cname && !companyData.cname) && (!add1 && !companyData.add1) && (!add2 && !companyData.add2)
        //     && (!country && !companyData.country) && (!city && !companyData.city) && (!zip && !companyData.zip)
        //     && (!phone && !companyData.phone) && (!email && !companyData.email) && (!website && !companyData.website)
        //     && (!did && !companyData.did) && (!vat && !companyData.vat) && (!registration && !companyData.registration)
        //     && (!duns && !companyData.duns) && (!eori && !companyData.eori) && (!lei && !companyData.lei)
        //     && (!blockchainAddress && !companyData.blockchainAddress) && (!cpublickey && !companyData.cpublickey)
        //     && (!cprivatekey && !companyData.cprivatekey)) {
        //     setError("please fill all fields")
        // }
        // else {
        //     console.log("hello in else")
        //     // setOpen(true)
        //     saveData();
        // }
    }
    async function updateData() {
        try {
            const cname = document.getElementById('cname').value
            const add1 = document.getElementById('add1').value
            const add2 = document.getElementById('add2').value
            const city = document.getElementById('city').value
            const state = document.getElementById('state').value
            const country = document.getElementById('country').value
            const zip = document.getElementById('zip').value
            const phone = document.getElementById('phone').value
            const website = document.getElementById('website').value
            companyData = {
                cname: cname,
                add1: add1,
                add2: add2,
                city: city,
                state: state,
                country: country,
                zip: zip,
                phone: phone,
                website: website,
            }
            companyData = JSON.parse(
                companyProfile[localStorage.getItem('userEmail')]
            )
            companyData.cname = cname ? cname : companyData.cname
            companyData.add1 = add1 ? add1 : companyData.add1
            companyData.add2 = add2 ? add2 : companyData.add2
            companyData.city = city ? city : companyData.city
            companyData.state = state ? state : companyData.state
            companyData.country = country ? country : companyData.country
            companyData.zip = zip ? zip : companyData.zip
            companyData.phone = phone ? phone : companyData.phone
            companyData.website = website ? website : companyData.website
            upData()
        } catch (e) {
            console.log(e)
        }
    }
    function handleUpdateChange(e) {
        document.getElementById('add1').value = e.target.value
    }
    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb routeSegments={[{ name: 'My Company' }]} />
            </div>
            {/* <PasswordPopup status={open} close={handleClose} submit={saveData} /> */}
            <center>
                <h2>
                    <b>My Company information</b>
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
                        <label
                            style={{
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                display: 'block',
                            }}
                        >
                            <input
                                type="file"
                                name="profileImg"
                                style={{ display: 'none' }}
                                accept="image/*"
                                id="company-logo"
                                onChange={handleProfileImg}
                            />
                            <Avatar
                                className="cursor-pointer"
                                src={profileImg}
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    margin: 'auto',
                                }}
                            />
                        </label>
                    </Col>
                </Row>
                <Row className="pt-4">
                    <Col>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="cname"
                            label="Company name"
                            type="text"
                            name="cname"
                            fullWidth
                            variant="outlined"
                            // InputProps={{ readOnly: update }}
                            value={cname}
                            onChange={handleChange}
                            key={data && companyData.cname}
                            defaultValue={data && companyData.cname}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <TextField
                            margin="dense"
                            id="add1"
                            label="Address 1"
                            type="text"
                            name="add1"
                            fullWidth
                            variant="outlined"
                            // InputProps={{ readOnly: update }}
                            value={add1}
                            onChange={handleChange}
                            key={data && companyData.add1}
                            defaultValue={data && companyData.add1}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <TextField
                            margin="dense"
                            id="add2"
                            label="Address 2"
                            type="text"
                            name="add2"
                            fullWidth
                            variant="outlined"
                            // InputProps={{ readOnly: update }}
                            value={add2}
                            onChange={handleChange}
                            key={data && companyData.add2}
                            defaultValue={data && companyData.add2}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={4}>
                        <TextField
                            margin="dense"
                            id="city"
                            label="City"
                            type="text"
                            name="city"
                            fullWidth
                            variant="outlined"
                            // InputProps={{ readOnly: update }}
                            value={city}
                            onChange={handleChange}
                            key={data && companyData.city}
                            defaultValue={data && companyData.city}
                        />
                    </Col>
                    <Col md={4}>
                        <TextField
                            margin="dense"
                            id="state"
                            label="State"
                            type="text"
                            name="state"
                            fullWidth
                            variant="outlined"
                            // InputProps={{ readOnly: update }}
                            value={state}
                            onChange={handleChange}
                            key={data && companyData.state}
                            defaultValue={data && companyData.state}
                        />
                    </Col>
                    <Col md={4}>
                        <TextField
                            margin="dense"
                            id="country"
                            label="Country"
                            type="text"
                            name="country"
                            fullWidth
                            variant="outlined"
                            // InputProps={{ readOnly: update }}
                            value={country}
                            onChange={handleChange}
                            key={data && companyData.country}
                            defaultValue={data && companyData.country}
                        />
                    </Col>

                </Row>
                <Row>
                    <Col md={4}>
                        <TextField
                            margin="dense"
                            id="zip"
                            label="Zip/Postal code"
                            type="text"
                            name="zip"
                            fullWidth
                            variant="outlined"
                            // InputProps={{ readOnly: update }}
                            value={zip}
                            onChange={handleChange}
                            key={data && companyData.zip}
                            defaultValue={data && companyData.zip}
                        />
                    </Col>
                    <Col md={4}>
                        <TextField
                            margin="dense"
                            id="phone"
                            label="Phone number"
                            type="text"
                            name="phone"
                            fullWidth
                            variant="outlined"
                            // InputProps={{ readOnly: update }}
                            value={phone}
                            onChange={handleChange}
                            key={data && companyData.phone}
                            defaultValue={data && companyData.phone}
                        />
                    </Col>
                    <Col md={4}>
                        <TextField
                            margin="dense"
                            id="email"
                            label="Email id"
                            type="text"
                            name="email"
                            fullWidth
                            variant="outlined"
                            value={localStorage.getItem('userEmail')}
                            InputProps={{ readOnly: true }}
                            onChange={handleChange}
                        />
                    </Col>

                </Row>
                <Row>
                    <Col md={4}>
                        <TextField
                            margin="dense"
                            id="website"
                            label="Company website"
                            type="text"
                            name="website"
                            fullWidth
                            variant="outlined"
                            // InputProps={{ readOnly: update }}
                            value={website}
                            onChange={handleChange}
                            key={data && companyData.website}
                            defaultValue={data && companyData.website}
                        />
                    </Col>
                    <Col md={4}>
                        <TextField
                            margin="dense"
                            id="did"
                            label="DID number"
                            type="text"
                            name="did"
                            fullWidth
                            variant="outlined"
                            value={localStorage.getItem('idx_id')}
                            InputProps={{ readOnly: true }}
                            onChange={handleChange}
                        />
                    </Col>
                    <Col md={4}>
                        <TextField
                            margin="dense"
                            id="vat"
                            label="VAT number"
                            type="text"
                            name="vat"
                            fullWidth
                            variant="outlined"
                            InputProps={{ readOnly: update }}
                            value={vat}
                            onChange={handleChange}
                            key={data && companyData.vat}
                            defaultValue={data && companyData.vat}
                        />
                    </Col>

                </Row>
                <Row>
                    <Col md={4}>
                        <TextField
                            margin="dense"
                            id="registration"
                            label="Registration number"
                            type="text"
                            name="registration"
                            fullWidth
                            variant="outlined"
                            InputProps={{ readOnly: update }}
                            value={registration}
                            onChange={handleChange}
                            key={data && companyData.registration}
                            defaultValue={data && companyData.registration}
                        />
                    </Col>
                    <Col md={4}>
                        <TextField
                            margin="dense"
                            id="dunse"
                            label="DUNS number"
                            type="text"
                            name="duns"
                            fullWidth
                            variant="outlined"
                            InputProps={{ readOnly: update }}
                            value={duns}
                            onChange={handleChange}
                            key={data && companyData.duns}
                            defaultValue={data && companyData.duns}
                        />
                    </Col>
                    <Col md={4}>
                        <TextField
                            margin="dense"
                            id="eori"
                            label="EORI"
                            type="text"
                            name="eori"
                            fullWidth
                            variant="outlined"
                            InputProps={{ readOnly: update }}
                            value={eori}
                            onChange={handleChange}
                            key={data && companyData.eori}
                            defaultValue={data && companyData.eori}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <TextField
                            margin="dense"
                            id="lei"
                            label="LEI"
                            type="text"
                            name="lei"
                            fullWidth
                            variant="outlined"
                            InputProps={{ readOnly: update }}
                            value={lei}
                            onChange={handleChange}
                            key={data && companyData.lei}
                            defaultValue={data && companyData.lei}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <TextField
                            margin="dense"
                            id="blockchainadd"
                            label="Company blockchain account address"
                            type="text"
                            name="blockchainAddress"
                            fullWidth
                            variant="outlined"
                            value={wallet ? wallet.walletaddress : ''}
                            InputProps={{ readOnly: true }}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <TextField
                            margin="dense"
                            id="publickey"
                            label="Company Public key"
                            type="text"
                            name="cpublickey"
                            fullWidth
                            variant="outlined"
                            value={wallet ? wallet.publicKey : ''}
                            InputProps={{ readOnly: true }}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <TextField
                            margin="dense"
                            id="privatekey"
                            label="Company Private key"
                            type="password"
                            name="cprivatekey"
                            fullWidth
                            value={wallet ? wallet.privatekey : ''}
                            InputProps={{ readOnly: true }}
                            variant="outlined"
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <TextField
                            margin="dense"
                            id="token"
                            label="Company Token"
                            type="token"
                            name="token"
                            fullWidth
                            value={data && companyData.companyToken}
                            InputProps={{ readOnly: true }}
                            variant="outlined"
                        />
                    </Col>
                </Row>

                <center>
                    <Button
                        className="capitalize"
                        variant="contained"
                        color="primary"
                        type="submit"
                        onClick={() => (update ? updateData() : getData())}
                        disabled={!wallet || progress}
                    >
                        {update ? 'Update' : 'Save'}
                    </Button>
                    {'  '}
                    {progress && (
                        <div>
                            <WaitSnackbar
                                message={'please wait while profile saved'}
                            ></WaitSnackbar>
                            <CircularProgress />
                        </div>
                    )}
                </center>
            </Container>
        </div>
    )
}
