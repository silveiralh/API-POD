const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const express =require('express');

app = express();

//models
User = require ('./model/User')



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

app.get('/newPicture', (req, res) =>{
	res.render('newPicture',{username: req.cookies.login});
});

app.get('/search', (req, res) =>{
	res.render('search',{username: req.cookies.login});
});

app.get('/register', (req, res) =>{
	res.render('register');
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
	console.log(email + "  "+ username);
	if(email!=="" && username!== "" && password!==""){
		await User.cadastrar(email,username,password);
	}
	res.redirect('/search');
});

app.listen(3000);