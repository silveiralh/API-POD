const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const express =require('express');

const multer = require('multer');
// código para upload de imagens usando multer  https://github.com/watinha/node-examples/tree/master/express-03-upload
const storage = multer.memoryStorage();
const upload = multer({destination:'public/uploads'});
let cache = require('express-redis-cache');

let images=[];

//flag para saber se está logado, se é admin ou se é user normal
var ADMIN=-1;

app = express();
port = process.env.PORT || 3100;

//models
User = require ('./model/User');
PictureOfTheDay = require ('./model/PictureOfTheDay');

// cache
cache = cache({
  	prefix:'pod-api',
	host:'redis-15103.c14.us-east-1-3.ec2.cloud.redislabs.com',
	port: 15103,
	auth_pass:'KPdSgJnkJXOldBYlQSrzODzLSWJYBZka'
});

//FUNÇÃO DE INVALIDAÇÃO DO PROFESSOR
cache.invalidate = (name) => {
	return (req, res, next) => {
		const route_name = name ? name : req.url;
		if (!cache.connected) {
			next();
			return ;
		}
		cache.del(route_name, (err) => console.log(err));
		next();
	};
};

//template para renderizar handlebars
app.set('view engine','hbs');
app.set('views',path.join(__dirname,'view'));
app.use(express.static(path.join(__dirname,'styles')));
app.use(express.urlencoded({
	extended: false
	}));
app.use(cookieParser());

// rotas get
app.get('/', cache.invalidate(), (req, res) =>{
	if(req.cookies && req.cookies.login){
		
		console.log("console para ver se passa");
		if(ADMIN==1){
			console.log(ADMIN+"ADMIN")
			res.redirect('/newPicture');
		}else if(ADMIN==0){
			console.log(ADMIN+"ADMIN")
			res.redirect('/search');
		}
	}else{
		console.log(ADMIN+"ADMIN")
		res.render('login');
	}
});

app.get('/register', (req, res) =>{
	if(req.cookies && req.cookies.login ){
		if(ADMIN=1){
			res.redirect('/newPicture');
		}else{
			res.redirect('/search');
		}
	}else{
		res.render('register');
	}
});

app.get('/newPicture', (req, res) =>{
	if(req.cookies && ADMIN===1 ){
		if(ADMIN==-1){
			res.redirect('/');
		}else{
			res.render('newPicture',{admin: req.cookies.login});
		}
	}else{
		res.redirect('/search');
	}
});

app.get('/search', async (req, res) =>{
	if(req.cookies && req.cookies.login ){
		if(ADMIN==-1){
			res.redirect('/');
		}else{
			let picture = await PictureOfTheDay.buscar(req.query.date) ;
			res.render('search',{picture:picture, admin: req.cookies.login});
		}
	}else{
		res.redirect('/');
	}
});
 
app.get('/logout',cache.invalidate(),  async (req,res) =>{ 
	ADMIN=-1;
	res.cookie('login', ADMIN);
	console.log(ADMIN +"aqui");
	res.clearCookie('login');
	res.clearCookie('connect.sid');
	res.redirect('/');
});

//rotas post

app.post('/', async (req,res) =>{
	const username = req.body.username;
	const password = req.body.password;;
	if(username!==""&&password!==""){
		console.log(ADMIN+"oioioioi");
		ADMIN = await User.logar(username,password);
		if(ADMIN!==-1){
			res.cookie('login', ADMIN);
			if (ADMIN==1){
				res.redirect('/newPicture');
			}else {
				res.redirect('/search');
			}
			return;
		}else{
			res.redirect('/');
		}
	}
});

app.post('/register', cache.invalidate(), async (req,res) =>{
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	if(email!=="" && username!== "" && password!==""){//se não possui campos vazios cadastra
	console.log(username+password);
		await User.cadastrar(email,username,password);
	}
	res.redirect('/');
});

app.post('/newPicture', // upload.single('picture'), 
	async (req,res) =>{
	const tittle = req.body.tittle;
	const date = req.body.date;
	const author = req.body.author;
	const description = req.body.description;
	let picture="";
	console.log(tittle + "  "+ date);
	if(req.file !== undefined){
		picture = req.file.buffer.toString("base64");
	}else{
		picture = "noimage.png";
	}
	if(tittle!==""&&date!==""&&author!==""&&description!==""){//se não possui campos vazios cadastra
		item = await PictureOfTheDay.cadastrar(tittle, date, author, description);
	}
	res.redirect('/newPicture');

});

app.listen(port);