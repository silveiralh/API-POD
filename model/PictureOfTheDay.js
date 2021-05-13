const Mongo = require('mongodb').MongoClient;

module.exports = class PictureOfTheDay{
	static async cadastrar(tittle, date, author, description){
		const mongo = await Mongo.connect('mongodb://localhost/pod-api', {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		const db = mongo.db();

		const pictures =  await db.collection('pictures').find({ date: date}).toArray();

		if (tittle!==""&&date!==""&&author!==""&&description!==""){
			await db.collection('pictures').insertOne({
                tittle: tittle,
                date: date,
                author: author, 
                description: description
                });
		}


		mongo.close();

		return "OK";
	}

	static async buscar(busca){
		const mongo = await Mongo.connect('mongodb://localhost/pod-api', {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		const db = mongo.db();
		const result = null;

		if(busca){
			result =  await db.collection('pictures').find({ nome: new RegExp('^' + busca)} ).toArray();
		}
		mongo.close();
		return result
	}
}