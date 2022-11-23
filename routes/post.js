const express = require('express');
const router = express.Router();
const axios = require('axios');
const models = require('../database/models');
const { auth,authManage } = require('./isLogined');
const { uploadInsta } = require('./ins_upload');
const {uploadFacebk} = require("./fbk_upload");
const multer = require("multer");
const fs = require('fs');
let df = fs.readFileSync('../test.json').toString();
router.get('/',async (req, res, next) => {
    models.Board.findAll({
        include: [
            {
                model: models.Users,
                attributes: ['code', 'name', 'nickname'],
            },
            {
                model: models.AllowBoard,
                attributes: ['AllowBoardCode'],
            }
        ],
        order: [[models.AllowBoard,'AllowBoardCode', 'ASC']],
        where: {allowBoard: true}
    }).then((result) => {
        result = JSON.parse(JSON.stringify(result));
        return res.json(result.reverse());
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Server Error');
    })
})


router.post('/',auth,async (req, res, next) => {
    //console.log(req);
    let {Usercode,isAnonymous,contents,Image} = req.body;
    if(isAnonymous == true){
        Usercode = -1;
    }
    models.Board.create({
        contents : contents,
        allowBoard: false,
        userCode: Usercode,
        isAnonymous: isAnonymous,
        Image: Image
    }).then(() => {
        df = fs.readFileSync('../test.json').toString();
        let test = {contents,Image};
        let a = JSON.parse(df);
        a.push(test);
        a = JSON.Stringify(a);
        fs.writeFileSync('../test.json',a);
        return  res.status(200).send('Success');
    }).catch((err) => {
        console.error(err);
        return res.status(500).send('Server Error');
    })
})

router.delete('/',authManage,async (req, res, next) => {

    models.Board.destroy({
        where: {boardCode: req.body.boardCode}
    }).then(() => {
        return res.status(200).send('Success');
    }).catch((err) => {
        console.error(err);
        return res.status(500).send('Server Error');
    })
})

router.post('/update',authManage,async (req, res, next) => {
    models.Board.update({
        allowBoard : true,
    },{
        where: {boardCode: req.body.boardCode}
    }).catch(err => {
        console.error(err);
        return res.status(500).send('Server Error');
    })
    models.AllowBoard.create({
        boardCode : req.body.boardCode,
        }).then((data) => {
        uploadInsta(req.body.boardCode);
        uploadFacebk(req.body.boardCode);





        //console.log(data);
        return res.status(200).send('Success');
    }).catch((err) => {
        console.error(err);
        return res.status(500).send('Server Error');
    });
    // insUpload.insAPI();
})

router.get('/manage',authManage,async (req, res, next) => {
    models.Board.findAll({
        include: [
            {
                model: models.Users,
                attributes: ['code', 'name', 'nickname'],
            },{
                model: models.AllowBoard,
                attributes: ['AllowBoardCode'],
            }
        ],
        order: [['boardCode', 'ASC']],
    }).then((result) => {
        res.send(result);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Server Error');
    })
})

module.exports = router;