const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const express =require('express');
// const multer = require('multer');
// código para upload de imagens usando multer  https://www.youtube.com/watch?v=YM5TTZm8yRY&ab_channel=Maransatto
// const upload = multer({destination:'public/uploads'});
app = express();

//models
User = require ('./model/User');
PictureOfTheDay = require ('./model/PictureOfTheDay');


app.set('view engine','hbs');
app.set('views',path.join(__dirname,'view'));
app.use(express.static(path.join(__dirname,'styles')));
app.use(express.urlencoded({
	extended: false
	}));
app.use(cookieParser());

// rotas get
app.get('/', (req, res) =>{
	res.render('login');
});

app.get('/register', (req, res) =>{
	res.render('register');
});

app.get('/newPicture', (req, res) =>{
	res.render('newPicture',{username: req.cookies.login});
});

app.get('/search',   async (req, res) =>{
	if(req.cookies && req.cookies.login){
		const picture = await PictureOfTheDay.buscar(req.query.date) ;
		res.render('search',{picture:picture});
	}else{
		res.redirect('/newPicture');
	}
});

//rotas post
app.post('/search', async (req,res) =>{
	res.clearCookie('login');
	res.redirect('/');
})

app.post('/',async (req,res) =>{
	const 	username = req.body.username;
	const password = req.body.password;
	if(username!==""&&password!==""){
		loginVerified = await User.logar(username,password);
		if(loginVerified!="NULL"){
			res.cookie('login');
			if (loginVerified==1){
				res.redirect('/newPicture');
			}else{
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
	res.redirect('/search');
});

app.post('/newPicture', 
	// upload.single('picture'), 
	async (req,res) =>{

	const tittle = req.body.tittle;
	const date = req.body.date;
	const author = req.body.author;
	const description = req.body.description;
	console.log(tittle + "  "+ date);
	if(tittle!==""&&date!==""&&author!==""&&description!==""){//se não possui campos vazios cadastra
		item = await PictureOfTheDay.cadastrar(tittle, date, author, description);
	}
	res.redirect('/newPicture');
});

app.listen(3000);