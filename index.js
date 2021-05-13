const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const express =require('express');

//models
Users = require ('./model/User')

app = express();

app.set('view engine','hbs');
app.set('views',path.join(__dirname,'view'));
app.use(express.static(path.join(__dirname,'styles')));
app.use(express.urlencoded({
	extended: false
	}));
app.use(cookieParser());


app.get('/', (req, res) =>{
	res.render('login');
})

app.get('/newPicture', (req, res) =>{
	res.render('newPicture',{username: req.cookies.login});
})

app.get('/search', (req, res) =>{
	res.render('search',{username: req.cookies.login});
})

app.get('/register', (req, res) =>{
	res.render('register');
})

app.post('/search', async (req,res) =>{
	res.clearCookie('login');
	res.redirect('/');
})

app.listen(3000);