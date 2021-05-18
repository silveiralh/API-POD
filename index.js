const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const express =require('express');
let cache = require('express-redis-cache');

// código para upload de imagens usando multer  https://github.com/watinha/node-examples/tree/master/express-03-upload
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({destination:'public/uploads'});
let images=[];

var ADMIN=-1;//flag para saber se está logado, '1' - admin, '0' user, '-1' não logado

app = express();
port = process.env.PORT || 3000;//PORTA HEROKU OU LOCALHOST:3000 PARA ACESSO LOCAL

//models
User = require ('./model/User');
PictureOfTheDay = require ('./model/PictureOfTheDay');

//template para renderizar handlebars
app.set('view engine','hbs');
app.set('views',path.join(__dirname,'view'));
app.use(express.static(path.join(__dirname,'styles')));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// cache com o host criado no redislabs
cache = cache({
  	prefix:'pod-api',
	host:'redis-15103.c14.us-east-1-3.ec2.cloud.redislabs.com',
	port: 15103,
	auth_pass:'KPdSgJnkJXOldBYlQSrzODzLSWJYBZka'
});

cache.invalidate = (name) => {//FUNÇÃO DE INVALIDAÇÃO DO PROFESSOR
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

// ROTAS GET
app.get('/', cache.invalidate(), (req, res) =>{//RENDERIZA PAGINA DE LOGIN
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

app.get('/register', (req, res) =>{//CADASTRO DE USUARIO
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

app.get('/newPicture', (req, res) =>{//RENDERIZA PAGINA DE CADASTRO DE IMAGEM DO DIA
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

app.get('/search', async (req, res) =>{//RENDERIZA PAGINA DE BUSCA POR DATA
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
 
app.get('/logout',cache.invalidate(),  async (req,res) =>{ //LOGOUT COM INVALIDAÇÃO DE CACHE E CLEAR COOKIES
	ADMIN=-1;
	res.cookie('login', ADMIN);
	res.clearCookie('login');
	res.clearCookie('connect.sid');
	res.redirect('/');
});

//ROTAS POST
app.post('/', async (req,res) =>{//REALIZA LOGIN
	const username = req.body.username;
	const password = req.body.password;;
	if(username!==""&&password!==""){
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

app.post('/register', cache.invalidate(), async (req,res) =>{//REALIZA O CADASTRO DE UM NOVO USUARIO VALOR PADRÃO DE PERMISSÃO=0
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	if(email!=="" && username!== "" && password!==""){//se não possui campos vazios cadastra
		await User.cadastrar(email,username,password);
	}
	res.redirect('/');
});

app.post('/newPicture', // upload.single('picture'), //SUBMETE OS DADOS DE CADASTRO DE UMA IMAGEM DO DIA
	async (req,res) =>{
	const tittle = req.body.tittle;
	const date = req.body.date;
	const author = req.body.author;
	const description = req.body.description;
	let picture="";
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