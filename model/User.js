const Mongo = require('mongodb').MongoClient;

module.exports = class Users{
	
    static async logar(username,password){
		
		const mongo = await Mongo.connect('mongodb://localhost/pod-api', {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		const db = mongo.db();
		const answer =  await db.collection('users').find({
            username:username,
            password:password
        }).toArray();
		mongo.close();
		if(answer.length>0){
			return answer[0].admin;
		}else{
			return "NULL";
		}
	}

	static async cadastrar(email, username, password){
		const mongo = await Mongo.connect('mongodb://localhost/pod-api', {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		const db = mongo.db();
		const usernameArray =  await db.collection('users').find({username:username}).toArray();
		const emailArray =  await db.collection('users').find({email:email}).toArray();

		if (usernameArray.length===0&&emailArray.length===0){
			await db.collection('users').insertOne({
				email: email,
                username:username,
                password:password,
                admin:0
            });
		}
		mongo.close();
	}
}