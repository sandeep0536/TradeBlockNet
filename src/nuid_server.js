const bodyParser = require('body-parser')
const express = require('express');
const fs = require('fs');
const app = express();

var options = {
    key: fs.readFileSync('/etc/ssl/private/nextfileshare_com.key'),
    cert: fs.readFileSync('/etc/ssl/private/nextfileshare_com.crt'),
    requestCert: false
};
var server = require('https').createServer(options, app);
var allowedOrigins = "https://www.nextfileshare.com/:*"
var io = require('socket.io')(server);
const cors = require('cors')
const { MD5 } = require('crypto-js');
var request = require('request');
let nodemailer = require('nodemailer');
const encrypt = require('node-file-encrypt');
const Secret_Key = "sk_test_51K4PwzSIO6cxIMLS7eKauTVr2CNjLy7s4XkVI6MIJUX3TY91YcAjdYNyNEr42Jo6ovjwANTIuKlfnfRMpS6MuwN600MVVVNaqY";
const stripe = require('stripe')(Secret_Key)
const mysql = require('mysql');
app.use(bodyParser.json())
/**
 * for origin problem use cors
 */
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Accept', 'Content-Type']
    })
)

/**
 * Create connetion of MySql
 */
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nextfileshare_db"
});

/**
 * function to check if connection established or not
 */
function checkConnection() {
    con.connect(function (err) {
        console.log(err)
        if (err) return false;
        return true;
    });
}
app.post("/storedid", ({ body }, res) => {
    if (checkConnection) {
        try {
            const query = `update  user_table set user_did='${body.did}' where email='${body.email}'`;
            con.query(query, function (err, result) {
                if (err) console.log(err)
                else {
                    res.send({
                        "status": "OK"
                    })
                }
            })
        } catch (e) {
            console.log(e)
        }
    } else {
        console.log("sorry,connection not established")
    }
})

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
                        console.log(response.body)
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
        console.log(body)
        var transporter = nodemailer.createTransport({
            host: "smtp.tradeblocknet.com",
            // service: 'gmail',
            port: 465,
            secure: true,
            auth: {
                user: 'support@tradeblocknet.com',
                pass: 'Trade208!'
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        var mailOptions = {
            from: body.from,
            to: body.to,
            subject: body.subject,
            html: `${body.email}`,
            cc: body.ccaddress
        };
        transporter.verify(function (error, success) {
            console.log(error)
            if (error) {
                res.json({
                    status: 'fail',
                    error: error
                })
            } else {
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        res.json({
                            status: 'fail',
                            error: error
                        })
                    } else {
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
            console.log(result)
            res.send({
                "file": result.toString("binary")
            })
        })
    } catch (e) {
        console.log(e)
    }
})

/**
 * Api will call when user click on Free plan
 */
app.post('/freeplan', async ({ body }, res) => {
    if (checkConnection) {
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
            console.log(e)
        }
    } else {
        console.log("sorry,connection not established")
    }
})

app.post('/savepaymentdata', async ({ body }, res) => {
    if (checkConnection) {
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
    }
})

async function saveData(plan, email, upgrade, change) {
    if (checkConnection) {
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
                let sql = `INSERT INTO user_table (email,sub_type,sub_start_date,sub_end_date,purchase_date,date) VALUES ('${email}','${plan}','${startDate}','${endDate}','${startDate}','${startDate}')`;
                con.query(sql, function (err, result) {
                    if (err) console.log(err);
                    else {
                        console.log("your plan successfully addedd");

                    }
                });
            }
        } catch (e) {
            console.log(e)
        }
    } else {
        console.log("sorry,connection not established")
    }
}
Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

/**
 * when user successfully pay then this Api will call
 */
app.get('/success', async (req, res) => {
    if (checkConnection) {
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
            console.log(e)
        }
    } else {
        console.log("sorry,connection not established")
    }
})

/**
 * Api to get current user subscription status
 */
app.post('/getsubscriptionstatus', ({ body }, res) => {
    try {
        if (checkConnection) {
            con.query(`SELECT plan,u.sub_end_date,u.user_did from plans_table p JOIN user_table u ON p.id=u.sub_type where email = '${body.email}'`, function (err, result) {
                if (err) console.log(err);
                if (result.length > 0) {
                    res.send({
                        "result": JSON.stringify(result)
                    })
                } else if (body.email != null) {
                    saveData(1, body.email, "", "")
                    con.query(`SELECT plan,u.sub_end_date,u.user_did from plans_table p JOIN user_table u ON p.id=u.sub_type where email = '${body.email}'`, function (err, result) {
                        if (err) console.log(err);
                        if (result.length > 0) {
                            res.send({
                                "result": JSON.stringify(result)
                            })
                        }
                    })
                }
            });
        } else {
            console.log("sorry,connection not established")
        }
    } catch (e) {
        console.log(e)
    }
})

/**
 * Api to get all plans from Database which is adfdedd by admin
 */
app.post('/fetchplans', ({ body }, res) => {
    try {
        if (checkConnection) {
            con.query(`SELECT * FROM plans_table`, function (err, result) {
                if (err) console.log(err);
                console.log(result)
                res.send({
                    "result": JSON.stringify(result)
                })
            });
        } else {
            console.log("sorry,connection not established")
        }
    } catch (e) {
        console.log(e)
    }
});


app.listen(3001, () => {
    console.log(`Server listening on 3001`);
});