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
port = process.env.PORT || 3000;

//models
User = require ('./model/User');
PictureOfTheDay = require ('./model/PictureOfTheDay');
// cache

// cache = cache({
// 	prefix:'redis-test',
// 	host:'redis',
// 	port: 6379
// });

// //FUNÇÃO DE INVALIDAÇÃO DO PROFESSOR
// cache.invalidate = (name) => {
// 	return (req, res, next) => {
// 		const route_name = name ? name : req.url;
// 		if (!cache.connected) {
// 			next();
// 			return ;
// 		}
// 		cache.del(route_name, (err) => console.log(err));
// 		next();
// 	};
// };

app.set('view engine','hbs');
app.set('views',path.join(__dirname,'view'));
app.use(express.static(path.join(__dirname,'styles')));
app.use(express.urlencoded({
	extended: false
	}));
app.use(cookieParser());

// rotas get
app.get('/', (req, res) =>{
	if(req.cookies && req.cookies.login){
		if(ADMIN==1){
			res.redirect('/newPicture');
		}else if(ADMIN==0){
			res.redirect('/search');
		}
	}else{
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

app.get('/search', 
	// cache.route(),
	  async (req, res) =>{
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

//rotas post
app.post('/search', async (req,res) =>{ //clicar em sair(ainda não funciona)
	ADMIN=-1;
	res.cookie('login', ADMIN);
	console.log(ADMIN +"aqui");
	res.clearCookie('connect.sid');
	res.redirect('/');
})

app.post('/',async (req,res) =>{
	const 	username = req.body.username;
	const password = req.body.password;
	if(username!==""&&password!==""){
		ADMIN = await User.logar(username,password);
		console.log(ADMIN);
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

app.post('/register',  async (req,res) =>{

	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	console.log(username+password);

	if(email!=="" && username!== "" && password!==""){//se não possui campos vazios cadastra
		await User.cadastrar(email,username,password);
	}
	res.redirect('/');
});

app.post('/newPicture', upload.single('picture'), async (req,res) =>{

	const tittle = req.body.tittle;
	const date = req.body.date;
	const author = req.body.author;
	const description = req.body.description;
	console.log(tittle + "  "+ date);
	if(req.file !== undefined){
		imagem = req.file.buffer.toString("base64");
	}else{
		imagem = "noimage.png";
	}
	if(tittle!==""&&date!==""&&author!==""&&description!==""){//se não possui campos vazios cadastra
		item = await PictureOfTheDay.cadastrar(tittle, date, author, description, picture);
	}
	res.redirect('/newPicture');
});




app.listen(port);