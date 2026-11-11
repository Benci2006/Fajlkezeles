const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');
const { threadCpuUsage } = require('process');
const { request } = require('http');
const { appendFile } = require('fs');

//fajlkezeles szinkron modon
// const fs2 = require('fs');//Amennyiben szinkron akkor csak fsre van szukseg
// const { request } = require('http');
// const data = fs2.readFileSync('file.txt', 'utf8')
// //file irasa
// fs2.writeFileSync(
//     'file.txt',
//     'Content amit kiirunk valtozo is lehet',
//     'utf8'

// )

//fajlkezeles asszinkron modon
const readtextfile = async(filePath)=>{
    try{
        const text = await fs.readFile(filePath, 'utf8')
        return text
    }
    catch(error){
        throw new error("Olvasasi hiba")
    }
     
}
//jsonfileolvasasa
const readjsnonfile = async(filePath) =>{
    try{
        const raw = await fs.readFile(filePath, "utf8")
        return JSON.parse(raw) //atalkitjuk jsonne

    }
    catch(error){
        throw new Error("Olvasasi hiba")
    }
}
//fajl irasa
const writetextfile=async(filePath, content)=>{
    try{
        await fs.writeFile(filePath, content, 'utf8')
        return "a fajl sikeresen elkeszult"
    }
    catch(error)
    {
        throw new Error("Hiba történt a fájl irasakor")
    }
}
//json irasa

const writejsonfile = async(filePath, content)=>{
    try{
        const jsondata = JSON.stringify(content, null, 2)
        await fs.writeFile(filePath, jsondata, 'utf8')
        return "Sikeresen letrehozva"
    }
    catch(error){
        throw new Error("Hiba a file irasakor")
    }
}

//file letezik e

const fileExists = async(filePath)=>{

    try{
        await fs.access(filePath)
        return true//ha a fuggvenyhivas nem ad hibat ugy letezik a file
    }
    catch(error){
        return false
    }

}

//meghivasa

// const exists = await fileExists("valami.txt")
// if(exists){
//     console.log("Létezik")
// }
// else{
//     console.log("Nem Létezk")
// }

//file bovitese

const appendtextfile=async(filePath, content)=>{
    try{
        await appendFile(filePath, content, "utf8")
        return "A fajl sikeresen bovitve"
    }
    catch(error){
        throw new Error("Hiba: ", error)
    }
}
//endpoints
router.post('/append-text', async(request, response)=>{

    try{
        const text = request.body.text
        const utvonal =  path.join(__dirname, '../files/notes.txt')
        const message = await appendtextfile(utvonal, text)
        response.status(200).json({
            
            success: true,
            Message: message
        })
        
        
    }   
    catch(error)
    {
        response.status(500).json({
            success:false
        })
        
    }

    
})

router.post('/write-json', async(request, response)=>{

    try{
        const data = request.body
        const utvonal = path.join(__dirname, '../files/writejson.json')
        const message = await writejsonfile(utvonal, data)
         response.status(200).json({
            
            success: true,
            Message: message
        
        })
    }   
    catch(error)
    {
        response.status(500).json({
            success:false
        })
        throw new error("HIba")
    }


})

router.post('/write-text', async(request, response)=>{

    try{
        const text = request.body.text
        const utvonal = path.join(__dirname, '../files/writeText.txt')
        const message = await writetextfile(utvonal, text)
        response.status(200).json({
            
            success: true,
            Message: message
        
        })

    }
    catch(error){

        response.status(500).json({
            success:false
        })
    }


})

router.get('/read-text', async(request, response)=>{
    try{
        const utvonal = path.join(__dirname, '../files/notes.txt')
        const content = await readtextfile(utvonal)
        response.status(200).json({
            success: true,
            Content: content
        })
    }
    catch(error){

        response.status(500).json({
            success:false
        })
    }
})


router.get('/read-json', async(request, response)=>{
    try{
        const utvonal = path.join(__dirname, '../files/datas.json')
        const content = await readjsnonfile(utvonal)
        response.status(200).json({
            success:true,
            content: content
        })
        
    }
    catch(error){
        response.status(500).json({
            success: false
        })
    }
})
const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const upload = multer({ storage });

//!Endpoints:
//?GET /api/test
router.get('/test', (request, response) => {
    response.status(200).json({
        message: 'Ez a végpont működik.'
    });
});

//?GET /api/testsql
router.get('/testsql', async (request, response) => {
    try {
        const selectall = await database.selectall();
        response.status(200).json({
            message: 'Ez a végpont működik.',
            results: selectall
        });
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});

module.exports = router;
