require('dotenv').config({
    path: __dirname + '/.env'
})
const express = require('express');
const app = express();
const multer = require('multer')
const upload = multer()

const aws = require('aws-sdk')
aws.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SERCET_ACCESS_KEY,
})
const docClient = new aws.DynamoDB.DocumentClient();
const tableName = 'ontap'
app.use(express.json({ extended: false }));
app.use(express.static('./template'))
app.set('view engine', 'ejs')
app.set('views', './template')

app.get('/', (request, response) => {
    const param = {
        TableName: tableName
    }
    docClient.scan(param, (err, data) => {
        if (err) {
            return console.log('ERROR')
        }
        return response.render('home/index', { data: data.Items })
    })

});

app.post('/', upload.fields([]), (request, response) => {
    const { maCongTy, tenCongTy, anhDaiDien } = request.body
    const param = {
        TableName: tableName,
        Item: {
            maCongTy: Number.parseInt(maCongTy),
            tenCongTy,
            anhDaiDien
        }
    }
    docClient.put(param, (err, data) => {
        if (err) {
            console.log(err)
            return response.redirect("/")
        }
        return response.redirect("/")
    })

});

app.post('/delete/:maCongTy', upload.fields([]), (request, response) => {
    const { maCongTy } = request.params
    const param = {
        TableName: tableName,
        Key: {
            maCongTy: Number.parseInt(maCongTy),
        }
    }
    docClient.delete(param, (err, data) => {
        if (err) {
            console.log(err)
            return response.redirect("/")
        }
        return response.redirect("/")
    })

});

// app.get('/:maCongTy', upload.fields([]), (request, response) => {
//     const { maCongTy } = request.params
//     const param = {
//         TableName: tableName,
//         Key: {
//             maCongTy: Number.parseInt(maCongTy),
//         }
//     }
//     docClient.scan(param, (err, data) => {
//         if (err) {
//             console.log(err)
//             return response.redirect("/")
//         }
//         console.log(data.Items)
//         return response.render("detail/index", { data: data.Items[0] })
//     })

// });


app.get("/:maCongTy", (req, res) => {
    const { maCongTy } = req.params;
    const params = {
        TableName: tableName,
        KeyConditionExpression: "#maCongTy = :maCongTy",
        ExpressionAttributeNames: {
            "#maCongTy": "maCongTy",
        },
        ExpressionAttributeValues: {
            ":maCongTy": parseInt(maCongTy),
        },
    };
    docClient.query(params, (err, data) => {
        if (err) {
            res.send("Interval err: " + err);
        } else {
            return res.render("detail/index", { data: data.Items[0] });
        }
    });
});

app.listen(3000, () => (
    console.log('Server is running')
))