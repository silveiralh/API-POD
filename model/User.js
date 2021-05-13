const Mongo = require('mongodb').MongoClient;

module.exports = class Users{
	
    static async login(username,password){
		const mongo = await Mongo.connect('mongodb://localhost/pod-api');
		const db = mongo.db();

		let result =  await db.collection('users').find({
            username:username,
            password:password
        }).toArray();

		mongo.close();
		return result.length
	}

	static async cadastrar(email, username,password){
		const mongo = await Mongo.connect('mongodb://localhost/pod-api');
		const db = mongo.db();
		let usernameArray =  await db.collection('users').find({username:username}).toArray();
		let emailArray =  await db.collection('users').find({email:email}).toArray();

		if (usernameArray.length===0&&emailArray.length===0){
			db.collection('users').insertOne({
				email: email,
                username:username,
                password:password,
                admin:0
            });
		}
		conn.close();
	}
}