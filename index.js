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
app.use(express.static('public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var port = process.env.PORT || 3333;

var router = express.Router();

router.get('/', function(req, res){
  res.json({message: 'Hello express rest api!'});
});

router.get('/doc/:filename', function(req, res){
  var filename = req.params.filename;
  var path = __dirname+'/'+filename;

  res.download(path);
});

router.post('/upload', upload.single('arquivo'), function(req, res){
  console.dir(req.file);

  var filename = req.file.filename;
  var ext = req.file.originalname.split('.').pop();

  if(req.body.nome_arquivo)
    filename = req.body.nome_arquivo;

  var filenameTmp = __dirname+"/tmp/"+filename+'.'+ext;
  var filenameSaida = __dirname+"/"+filename+'.docx';

  fs.rename(req.file.path, filenameTmp, (err) => {
    if(err) throw err;
  });

  var content = fs.readFileSync(req.file.path, 'binary');

  var doc = new Docxtemplater(content);

  var b = JSON.parse(req.body.data);
  console.log(b);
  doc.setData(b);

  doc.render();

  var buf = doc.getZip()
               .generate({type:"nodebuffer"});

  fs.writeFileSync(filenameSaida,buf);


  res.json({
    'message' : 'Arquivo gerado com sucesso!',
    'filename' : filename+'.docx',
    'urlDownload' : '/api/doc/'+filename+'.docx'
  })

});

app.use('/api', router);

app.listen(port);
console.log('A magica acontece aqui na porta '+ port);
