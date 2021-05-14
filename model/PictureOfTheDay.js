const Mongo = require('mongodb').MongoClient;

module.exports = class PictureOfTheDay{
	static async cadastrar(tittle, date, author, description, 
        // picture
        ){
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
                description: description,
                // picture:pic
                });
		}
 

		mongo.close();

		return "OK";
	}

	static async buscar(query){
		let mongo = await Mongo.connect('mongodb://localhost/pod-api', {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		const db = mongo.db();
		let result = null;

		if(query){
            console.log(query);
			result =  await db.collection('pictures').findOne({ date: new RegExp('^' + query)} );
		}
		mongo.close();
		return result;
	}
}