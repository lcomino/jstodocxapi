'use strict';
var fs=require('fs');
var express = require('express');
var multer = require('multer');
var app = express();
var bodyParser = require('body-parser');
var Docxtemplater = require('docxtemplater');

var upload = multer({dest:__dirname+'/uploads/'});

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;

var router = express.Router();

router.get('/', function(req, res){
  res.json({message: 'Hello express rest api!'});
});

router.get('/docx', function(req, res){

  var content = fs.readFileSync(__dirname+"/nota.docx","binary");

  var doc = new Docxtemplater(content);

  doc.setData({
      "numero":"0002"
  });

  doc.render();

  var buf = doc.getZip()
               .generate({type:"nodebuffer"});

  fs.writeFileSync(__dirname+"/nota-saida.docx",buf);

  res.json({message: 'Arquivo gerado...'});

});

router.post('/gerar-documento', function(req, res){
  var body = req.body;

  res.json({message : body});

});

router.post('/upload', upload.single('arquivo'), function(req, res){
  console.dir(req.file);

  var filename = req.file.destination+req.file.originalname;
  var filenameSaida = __dirname+"/nota-saida.docx";

  fs.rename(req.file.path, filename, (err) => {
    if(err) throw err;
    console.log('file renamed... moved...');
  });

  var content = fs.readFileSync(filename, 'binary');

  var doc = new Docxtemplater(content);

  doc.setData(req.body);

  doc.render();

  var buf = doc.getZip()
               .generate({type:"nodebuffer"});

  fs.writeFileSync(filenameSaida,buf);
  res.download(filenameSaida);

});

app.use('/api', router);

app.listen(port);
console.log('A magica acontece aqui na porta '+ port);
