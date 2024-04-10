const bodyParser = require('body-parser')
const express = require('express');
const cors = require('cors')
const app = express();
const fs = require('fs');
// var options = {
//     key: fs.readFileSync('/etc/ssl/private/nextfileshare_com.key'),
//     cert: fs.readFileSync('/etc/ssl/private/nextfileshare_com.crt'),
//     requestCert: false
// };
// var server = require('https').createServer(options, app);
const { MD5 } = require('crypto-js');
var request = require('request');
let nodemailer = require('nodemailer');
const encrypt = require('node-file-encrypt');
// test stripe key
const Secret_Key = "sk_test_51K4PwzSIO6cxIMLS7eKauTVr2CNjLy7s4XkVI6MIJUX3TY91YcAjdYNyNEr42Jo6ovjwANTIuKlfnfRMpS6MuwN600MVVVNaqY";
// main stripe key
// const Secret_Key = "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";
const stripe = require('stripe')(Secret_Key)
const mysql = require('mysql');
const passport = require("passport-twitter");
const axios = require("axios")
const LoginWithTwitter = require('login-with-twitter')
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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");
const tw = new LoginWithTwitter({
    consumerKey: 'n6ejWaQr2aIdwxvWZrsrYb8ut',
    consumerSecret: 'zYDiEOPh0R1EYpfeb5W8kdVFVw7XzzXdLr7bwfw5977vClr2Ir',
    callbackUrl: 'http://localhost:3000/login'
})
app.use(bodyParser.json())
/**
 * for origin problem use cors
 */
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'DELETE'],
        allowedHeaders: ['Accept', 'Content-Type']
    })
)

/**
 * Create connetion of MySql
 */
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "dlt_db"
});

// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "nextfileshare_db"
// });

/**
 * function to check if connection established or not
 */
con.connect(function (err) {
    if (err) throw err;
    console.log("Connection successfully established!");
});
/**
 * Api to convert xml data into EDI format
 */
app.post('/convertxmltoedi', ({ body }, res) => {
    try {
        var options = {
            'method': 'POST',
            'url': 'https://api.edi2xml.com/iBolt32/MGrqispi.dll',
            form: {
                'appname': 'IFSedi2xml_api',
                'prgname': 'HTTP',
                'arguments': '-AHTTPService#X12',
                'api_key': '020000004B818EAD85B67E5288BFCDD0E1AE22B38BD5019896A30BBBC8C3D3B934EACDC79EF924269ADC1CE30E73D031A15C6D466113EF023773E5D79CE3F2DFE08227FA',
                'api_pswd': '616156',
                'api_request': body.data
            }
        }
        request(options, function (error, response) {
            if (error) console.log(error)
            else {
                fs.writeFile("./b2bfiles/tempedifile.txt", response.body, function (err, file) {
                    if (err)
                        console.log(err)
                    else {
                        res.json({
                            "status": "OK"
                        })
                    }
                })
            }
        });
    } catch (e) {
        console.log(e)
    }
})

/**
 * Api to Send mail
 */
app.post('/sendmail', ({ body }, res) => {
    try {
        var transporter = nodemailer.createTransport({
            host: "mail.privateemail.com",
            port: 587,
            secure: false,
            auth: {
                user: 'support@tradeblocknet.com',
                pass: 'Ilovemango75'
            }
        });
        let email = body.email;
        const data = {
            email: '<b>Sender: </b>' + body.from + "<br/>" + email
        }
        var mailOptions = {
            from: 'support@tradeblocknet.com',
            to: body.to,
            subject: body.subject,
            html: `${data.email}`,
            cc: body.ccaddress
        };
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log("Server is ready to take our messages");
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log("error==========================>", error);
                        res.json({
                            status: 'fail'
                        })
                    } else {
                        console.log("success========================>");
                        res.json({
                            status: 'success'
                        })
                    }
                });
            }
        });
    } catch (e) {
        console.log(e)
    }
})

/**
 * Api to write Edi file
 */
app.post('/storeedifile', ({ body }, res) => {
    try {
        fs.writeFile("./tempedifile", body.data, function (err, file) {
            if (err)
                console.log(err)
            else {
                res.json({
                    "status": "OK"
                })
            }
        })
    } catch (e) {
        console.log(e)
    }
})

/**
 * Api to encrypt EDI data
 */
app.post('/encedidata', ({ body }, res) => {
    try {
        let filepath = "./b2bfiles/tempedifile.txt";
        let f = new encrypt.FileEncrypt(filepath);
        f.openSourceFile();
        f.encrypt(body.password);
        let encryptPath = f.encryptFilePath;
        fs.unlink("./b2bfiles/tempedifile.txt", function (err, result) {
            res.send({
                "file": encryptPath
            })
        })
    } catch (e) {
        console.log(e)
    }
})

/**
 * Api to encrypt Edi data when user share file
 */
app.post('/encryptshareedidata', ({ body }, res) => {
    try {
        fs.writeFile("./b2bfiles/tempshareedifile.txt", body.file, function (err, result) {
            let filepath = "./b2bfiles/tempshareedifile.txt";
            let f = new encrypt.FileEncrypt(filepath);
            f.openSourceFile();
            f.encrypt(body.password);
            let encryptPath = f.encryptFilePath;
            fs.unlink("./b2bfiles/tempshareedifile.txt", function (err, result) {
                res.send({
                    "file": encryptPath
                })
            })
        })
    } catch (e) {
        console.log(e)
    }
})

/**
 * Api to show Edi file at owner end
 */
app.post('/showedifile', ({ body }, res) => {
    try {
        let filepath = `./${body.file}`;
        let f = new encrypt.FileEncrypt(filepath);
        f.openSourceFile();
        f.decrypt(body.password);
        fs.readFile(`./b2bfiles/tempedifile.txt`, function (err, result) {
            fs.unlink(`./b2bfiles/tempedifile.txt`, function () { })
            res.send({
                "file": result.toString("binary")
            })
        })
    } catch (e) {
        console.log(e)
    }
})

/**
 * Api to show Edi file at reciever end
 */
app.post('/showshareedifile', ({ body }, res) => {
    try {
        let filepath = `./${body.file}`;
        let f = new encrypt.FileEncrypt(filepath);
        f.openSourceFile();
        f.decrypt(body.password);
        fs.readFile(`./b2bfiles/tempshareedifile.txt`, function (err, result) {
            fs.unlink(`./b2bfiles/tempshareedifile.txt`, function () { })
            res.send({
                "file": result.toString("binary")
            })
        })
    } catch (e) {
        console.log(e)
    }
})

app.post('/savepaymentdata', async ({ body }, res) => {
    try {
        const upgradePlan = false;
        const changePlan = false;
        con.query(`SELECT plan,u.sub_end_date,u.purchase_date from plans_table p JOIN user_table u ON p.id=u.sub_type where email = '${body.email}'`, async function (err, result) {
            if (err) console.log(err);
            if (Object.keys(result).length < 1) {
                await saveData(body.id, body.email, "", "")
                res.send({
                    status: "OK"
                })
            }
            else if (result[0].plan == body.id) {
                await saveData(body.id, body.email, "upgrade", "")
                res.send({
                    status: "OK"
                })
            } else {
                await saveData(body.id, body.email, "", "change")
                res.send({
                    status: "OK"
                })
            }
        });
    } catch (e) {
        res.send({
            status: false,
            error: e
        })
    }
})
async function saveData(plan, email, upgrade, change, accessToken, expiration) {
    try {
        var date = new Date();
        const addDate = date.addDays(30);
        var date_ob = new Date();
        var day = ("0" + date_ob.getDate()).slice(-2);
        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        var year = date_ob.getFullYear();
        var hours = date_ob.getHours();
        var minutes = date_ob.getMinutes();
        var seconds = date_ob.getSeconds();
        var startDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        var endDate = new Date(addDate).toISOString().slice(0, 19).replace('T', ' ');
        if (upgrade) {
            let sql = `INSERT INTO user_history (email,sub_type,sub_start_date,sub_end_date,purchase_date) 
                        select email,sub_type,sub_start_date,sub_end_date,purchase_date from user_table where
                        email='${email}'`;
            con.query(sql, function (err, result) {
                if (err) console.log(err);
                else {
                    let new_sql = `update user_table set sub_start_date='${startDate}',
                                sub_end_date='${endDate}',purchase_date='${startDate}',date='${startDate}'
                                where email='${email}'`;
                    con.query(new_sql, function (err, result) {
                        if (err) console.log(err)
                        else {
                            console.log("your plan successfully upgraded");
                        }
                    })
                }
            });
        } else if (change) {
            let sql = `INSERT INTO user_history (email,sub_type,sub_start_date,sub_end_date,purchase_date) 
                        select email,sub_type,sub_start_date,sub_end_date,purchase_date from user_table where
                        email='${email}'`;
            con.query(sql, function (err, result) {
                if (err) console.log(err);
                else {
                    console.log("check...")
                    let new_sql = `update user_table set sub_type='${plan}',sub_start_date='${startDate}',
                        sub_end_date='${endDate}',purchase_date='${startDate}',date='${startDate}'
                        where email='${email}'`;
                    con.query(new_sql, function (err, result) {
                        if (err) console.log(err)
                        else {
                            console.log("your plan successfully changed");
                        }
                    })
                }
            });
        } else {
            let sql = `INSERT INTO user_table (email,sub_type,sub_start_date,sub_end_date,purchase_date,date,NXFT_balance,
                accessToken,expiration) VALUES ('${email}','${plan}','${startDate}','${endDate}','${startDate}','${startDate}',100,'${accessToken}','${expiration}')`;
            con.query(sql, function (err, result) {
                if (err) console.log(err);
                else {
                    console.log("your plan successfully addedd");

                }
            });
        }
    } catch (e) {
        res.send({
            status: "OK"
        })
    }
}


Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}


/**
 * Api will call when user click on Free plan
 */
app.post('/freeplan', async ({ body }, res) => {
    try {
        var date_ob = new Date();
        const email = body.email;
        const addDate = date_ob.addDays(30);
        var day = ("0" + date_ob.getDate()).slice(-2);
        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        var year = date_ob.getFullYear();
        var hours = date_ob.getHours();
        var minutes = date_ob.getMinutes();
        var seconds = date_ob.getSeconds();
        var startDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        var endDate = new Date(addDate).toISOString().slice(0, 19).replace('T', ' ');
        let check = `select * from user_table where email='${email}'`;
        con.query(check, function (err, result) {
            if (result) {
                let sql = `INSERT INTO user_history (email,sub_type,sub_start_date,sub_end_date,purchase_date) 
                    select email,sub_type,sub_start_date,sub_end_date,purchase_date from user_table where
                    email='${email}'`;
                con.query(sql, function (err, result) {
                    let new_sql = `update user_table set sub_type='${body.id}',sub_start_date='${startDate}',
                                        sub_end_date='${endDate}',purchase_date='${startDate}',date='${startDate}'
                                        where email='${email}'`;
                    con.query(new_sql, function (err, result) {
                        if (err) console.log(err)
                        else {
                            res.send({
                                "status": "OK"
                            })
                        }
                    })
                })
            } else {
                let sql = `INSERT INTO user_table (email,sub_type,sub_start_date,sub_end_date,purchase_date,date)
                    values('${email}','${body.id}','${startDate}','${endDate}','${startDate}','${startDate}')`;
                con.query(sql, function (err, result) {
                    if (err) console.log(err)
                    else {
                        res.send({
                            "status": "OK"
                        })
                    }
                })

            }
        })

    } catch (e) {
        res.send({
            status: "OK"
        })
    }
})


/**
 * when user successfully pay then this Api will call
 */
app.get('/success', async (req, res) => {
    try {
        var date = new Date();
        const addDate = date.addDays(30);
        let plan = req.query.plan;
        console.log("plan :", plan)
        let email = req.query.email;
        var date_ob = new Date();
        var day = ("0" + date_ob.getDate()).slice(-2);
        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        var year = date_ob.getFullYear();
        var hours = date_ob.getHours();
        var minutes = date_ob.getMinutes();
        var seconds = date_ob.getSeconds();
        var startDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        var endDate = new Date(addDate).toISOString().slice(0, 19).replace('T', ' ');
        if (req.query.upgrade) {
            let sql = `INSERT INTO user_history (email,sub_type,sub_start_date,sub_end_date,purchase_date) 
                        select email,sub_type,sub_start_date,sub_end_date,purchase_date from user_table where
                        email='${email}'`;
            con.query(sql, function (err, result) {
                if (err) console.log(err);
                else {
                    let new_sql = `update user_table set sub_start_date='${startDate}',
                                sub_end_date='${endDate}',purchase_date='${startDate}',date='${startDate}'
                                where email='${email}'`;
                    con.query(new_sql, function (err, result) {
                        if (err) console.log(err)
                        else
                            console.log("your plan successfully upgraded")
                    })
                }
            });
        } else if (req.query.change) {
            let sql = `INSERT INTO user_history (email,sub_type,sub_start_date,sub_end_date,purchase_date) 
                        select email,sub_type,sub_start_date,sub_end_date,purchase_date from user_table where
                        email='${email}'`;
            con.query(sql, function (err, result) {
                if (err) console.log(err);
                else {
                    console.log("check...")
                    let new_sql = `update user_table set sub_type='${plan}',sub_start_date='${startDate}',
                        sub_end_date='${endDate}',purchase_date='${startDate}',date='${startDate}'
                        where email='${email}'`;
                    con.query(new_sql, function (err, result) {
                        if (err) console.log(err)
                        else
                            console.log("your plan successfully changed")
                    })
                }
            });
        } else {
            let sql = `INSERT INTO user_table (email,sub_type,sub_start_date,sub_end_date,purchase_date,date) VALUES ('${email}','${plan}','${startDate}','${endDate}','${startDate}','${startDate}')`;
            con.query(sql, function (err, result) {
                if (err) console.log(err);
                console.log("record inserted");
            });
        }
        res.redirect(`https://nextfileshare.com/subscription`)
    } catch (e) {
        res.send({
            status: "OK"
        })
    }
})

/**
 * Api to get current user subscription status
 */
app.post('/getsubscriptionstatus', ({ body }, res) => {
    try {
        console.log(body);
        con.query(`SELECT plan,plan_type,u.sub_end_date from plans_table p JOIN user_table u ON p.id=u.sub_type where email = '${body.email}'`, function (err, result) {
            if (err) {
                res.send({
                    "status": false,
                    "result": JSON.stringify(err)
                })
            }
            else if (result.length > 0) {
                res.send({
                    "status": true,
                    "result": JSON.stringify(result)
                })
            } else if (body.email != null) {
                saveData(1, body.email, "", "", body.accessToken, body.expiration)
                con.query(`SELECT plan,u.sub_end_date from plans_table p JOIN user_table u ON p.id=u.sub_type where email = '${body.email}'`, function (err, result) {
                    if (err) console.log(err);
                    if (result.length > 0) {
                        res.send({
                            "status": true,
                            "result": JSON.stringify(result)
                        })
                    }
                })
            }
        });
    } catch (e) {
        console.log(e)
        res.send({
            status: false,
            error: e
        })
    }
})
app.post('/userLogs', ({ body }, res) => {
    try {
        const query = `UPDATE user_table SET accessToken='${body.accessToken}',expiration='${body.expiration}' where email='${body.email}'`;
        con.query(query, function (err, result) {
            if (err) {
                res.send({
                    "status": false,
                    "result": JSON.stringify(err)
                });
            }
            if (result) {
                res.send({
                    "status": true,
                    "result": "Succesfully created userLogs"
                })
            }
        })
    } catch (e) {
        console.log(e)
        res.send({
            status: false,
            error: e
        })
    }
})
/*new api by sandip*/
app.post('/walletAddress', ({ body }, res) => {
    try {
        const query = `UPDATE user_table SET Wallet_address='${body.Wallet_address}' where email='${body.email}'`;
        con.query(query, function (err, result) {
            if (err) {
                res.send({
                    "status": false,
                    "result": JSON.stringify(err)
                });
            }
            if (result) {
                res.send({
                    "status": true,
                    "result": "succesfully created userLogs"
                })
            }
        })
    }
    catch (e) {
        console.log(e);
        res.send({
            status: false,
            error: e
        })
    }
})
/*new api by sandip*/
app.post('/userEmail', ({ body }, res) => {
    try {
        const query = `SELECT email from user_table where Wallet_address='${body.Wallet_address}'`;
        con.query(query, function (err, result) {
            if (err)
                return res.send({
                    "status": false,
                    "result": JSON.stringify(err)
                });
            if (result) {
                return res.send({
                    "status": true,
                    "result": result
                })
            }
        })
    }
    catch (e) {
        console.log(e)
        return res.send({
            status: false,
            error: e
        })
    }
})



app.post('/loginStatus', ({ body }, res) => {
    try {
        const query = `SELECT accessToken,expiration from user_table where email='${body.email}'`;
        con.query(query, function (err, result) {
            if (err)
                return res.send({
                    "status": false,
                    "result": JSON.stringify(err)
                });
            if (result) {
                return res.send({
                    "status": true,
                    "result": result
                })
            } else {
                return res.send({
                    "status": false,
                    "result": "Session has been expired please login again!"
                })
            }
        })
    }
    catch (e) {
        console.log(e)
        return res.send({
            status: false,
            error: e
        })
    }
})

/**
 * Api to get all plans from Database which is adfdedd by admin
 */
app.post('/fetchplans', ({ body }, res) => {
    try {
        con.query(`SELECT * FROM plans_table`, function (err, result) {
            if (err) console.log(err);
            res.send({
                "result": JSON.stringify(result)
            })
        });
    }
    catch (e) {
        console.log(e)
        res.send({
            status: false,
            error: e
        })
    }
});

/**
 * Apt to store transaction
 */
app.post('/storetransaction', ({ body }, res) => {
    try {
        con.query(`INSERT INTO transaction_reciept(file_hash,transaction_hash, block_number, event_type, status) 
            VALUES ('${body.fileHash}','${body.hash}',${body.bnumber},'${body.event}','${body.status}')`, function (err, result) {
            if (err) console.log(err);
            else {
                res.send({
                    "result": {
                        "status": true
                    }
                })
            }
        })
    }
    catch (e) {
        console.log(e)
        res.send({
            status: false,
            error: e
        })
    }
})

/**
 * Api to fetch all transfer transaction of give address
 */
app.post("/gettransferredfiles", ({ body }, res) => {
    try {
        con.query("SELECT * FROM file_events where `to`='" + body.address + "'", function (err, result) {
            if (err)
                console.log(err)
            else {
                res.send({
                    "result": {
                        "status": true,
                        "data": result
                    }
                })
            }
        })
    } catch (e) {
        res.send({
            status: false,
            error: e
        })
    }
})

/**
 * API to get all shared file
 */
app.post("/getallsharedfiles", ({ body }, res) => {
    try {
        con.query(`SELECT * from file_events where file_id='${body.fileId}'`, function (err, result) {
            if (err)
                console.log(err)
            res.send({
                "status": true,
                "data": result
            })
        })
    } catch (e) {
        res.send({
            status: false,
            error: e
        })
    }
})
/**
 * API to get all notifications
 */
app.post("/getnotifications", ({ body }, res) => {
    try {
        const query = "SELECT * from file_events where (`to`='" + body.email + "' OR `to`='" + body.address + "') AND `notification_status`='NOT_READ'";
        con.query(query, function (err, result) {
            if (err)
                console.log(err)
            res.send({
                "status": true,
                "data": result
            })
        })
    }
    catch (e) {
        res.send({
            status: false,
            error: e
        })
    }
})
/**
 * API to clear notifications
 */
app.post("/clearNotification", ({ body }, res) => {
    try {
        if (body.id != 0) {
            const query = "update file_events set `notification_status`='READ' where id='" + body.id + "'";
            con.query(query, function (err, result) {
                if (err)
                    console.log(err)
                res.send({
                    "status": true
                })
            })
        } else {
            const query = "update file_events set `notification_status`='READ'";
            con.query(query, function (err, result) {
                if (err)
                    console.log(err)
                res.send({
                    "status": true
                })
            })
        }

    } catch (e) {
        res.send({
            status: false,
            error: e
        })
    }
})

app.post("/getNXFTBalance", ({ body }, response) => {
    try {
        const query = `SELECT NXFT_balance FROM user_table WHERE email='${body.email}'`;
        const getTokenForAction = `SELECT tokens from token_distribution where id=${body.action}`;
        con.query(query, function (err, result) {
            if (err)
                console.log(err)
            con.query(getTokenForAction, function (err, actionResult) {
                if (err)
                    console.log(err)
                response.send({
                    "status": true,
                    "result": result,
                    "tokenPrice": actionResult[0].tokens
                })

            })
        })
    } catch (e) {
        res.send({
            status: false,
            error: e
        })
    }
})

app.post("/updateNXFTTokens", ({ body }, response) => {
    try {
        const getBalanceQuery = `SELECT NXFT_balance from user_table WHERE email='${body.email}'`;
        con.query(getBalanceQuery, function (err, result) {
            const addUpBalance = Number(result[0].NXFT_balance) + Number(body.tokens)
            const query = `UPDATE user_table SET NXFT_balance='${addUpBalance}' WHERE email='${body.email}'`;
            con.query(query, function (err, result) {
                if (err)
                    console.log(err)
                response.send({
                    "status": true,
                    "result": result
                })
            })
        })
    } catch (e) {
        res.send({
            status: false,
            error: e
        })
    }
})

app.post("/deducttokens", ({ body }, response) => {
    try {
        const getTokenForAction = `SELECT tokens from token_distribution where id=${body.action}`;
        const getBalanceQuery = `SELECT NXFT_balance from user_table WHERE email='${body.email}'`;
        con.query(getBalanceQuery, function (err, balanceResult) {
            const balance = Number(balanceResult[0].NXFT_balance);
            con.query(getTokenForAction, function (err, result) {
                const tokens = balance - ((body.files) * result[0].tokens);
                const query = `UPDATE user_table SET NXFT_balance='${tokens}' WHERE email='${body.email}'`;
                con.query(query, function (err, result) {
                    if (err)
                        console.log(err)
                    response.send({
                        "status": true,
                        "result": result
                    })
                })
            })
        })
    } catch (e) {
        res.send({
            status: false,
            error: e
        })
    }
})
app.post('/savecontact', ({ body }, res) => {
    try {
        con.query(`INSERT INTO contact(contact_name,contact_email,contact_address,contact_key,com_token,user_name,user_email,user_address,user_key ) 
        VALUES ('${body.contactname}','${body.contactemail}','${body.contactaddress}','${body.contactkey}','${body.token}','${body.username}','${body.useremail}','${body.useraddress}','${body.userkey}')`, function (err, result) {
            if (err) console.log(err);
            else {
                res.send({
                    "result": {
                        "status": true
                    }
                })
            }
        })
    }
    catch (e) {
        console.log(e)
    }
})
app.post('/fetchcontact', ({ body }, res) => {
    try {

        con.query(`SELECT contact_email as user_email , contact_address as user_address , contact_key as user_key , contact_name as user_name FROM contact where user_email = '${body.useremail}'`, function (err, result) {
            if (err) console.log(err);
            else {
                res.send({

                    "result": JSON.stringify(result)
                })
            }

        });

    } catch (e) {
        console.log(e)
    }
});

// app.post('/fetchallcontact', ({ body }, response) => {
//     try {
//         con.query(`SELECT * FROM contact where contact_email='${body.contact}'`, (err, result) => {
//             if (err) console.log(err);
//             else {
//                 response.send({
//                     "result": JSON.stringify(result)
//                 })
//             }
//         })
//     }
//     catch (e) {

//     }
// })

app.post('/fetchcontactParent', ({ body }, response) => {
    try {
        con.query(`SELECT contact_email as user_email , contact_address as user_address , contact_key as user_key , contact_name as user_name FROM contact where com_token = '${body.token}' OR user_email = '${body.useremail}'`, function (err, result) {
            if (err) console.log(err);
            // console.log( "indore " ,result )
            response.send({
                "result": JSON.stringify(result)
            })
        });

    } catch (e) {
        console.log(e)
    }
});



app.delete('/deletecontact', ({ body }, res) => {
    try {
        con.query(`DELETE FROM contact WHERE contact_email = '${body.contact}' AND user_email= '${body.emailuser}'`, function (err, result) {
            if (err) console.log(err);
            else {

                res.send({
                    "result": {
                        "status": JSON.stringify(result)
                    }
                })
            }
        })
    }
    catch (e) {
        console.log(e)
    }
})

app.post("/getallsharedfiles", ({ body }, res) => {
    try {
        con.query(`SELECT * from file_events where file_id='${body.fileId}'`, function (err, result) {
            if (err)
                console.log(err)
            res.send({
                "status": true,
                "data": result
            })
        })
    } catch (e) {
        res.send({
            status: false,
            error: e
        })
    }
})

app.post("/getTransactionReciept", ({ body }, res) => {
    try {
        con.query(`SELECT transaction_hash from transaction_reciept where file_hash='${body.filehash}'`, function (err, result) {
            if (err)
                console.log(err)
            res.send({
                "status": true,
                "data": result
            })
        })
    } catch (e) {
        res.send({
            status: false,
            error: e
        })
    }
})
app.listen(3001, () => {
    console.log(`Server listening on 3001`);
});