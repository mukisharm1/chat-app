var express = require("express");
 app= express();
 
var mongoose =require("mongoose");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var methodOverride= require("method-override");
var multer = require('multer');

require('dotenv').config();
var storage = multer.diskStorage({
  filename: function(_req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
  
});
var imageFilter = function (_req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'bandhanihouse', 
  api_key: process.env.API_KEY, 
  api_secret: process.env.SECRECT_API
});



mongoose.connect("mongodb://localhost/masti_app",{ useNewUrlParser: true,useUnifiedTopology:true});


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

mongoose.set('useFindAndModify', false);

//Schema setup
var chatSchema = new mongoose.Schema({
	tittle:String,
	image: String,
	body: String,
	created:{type:Date, default:Date.now},
	comments : [
		{
			ref :"Comment",
			type : mongoose.Schema.Types.ObjectId
		   
		}
	 ]
	
});
var Chat = mongoose.model("Chat",chatSchema);
// comments schema
var commentSchema = new mongoose.Schema({
    text: String,
    author: String
});
var Comment = mongoose.model("Comment",commentSchema);




app.get("/",function(_req,res){
    res.redirect("index")
});
app.get("/index",function(_req,res){
   Chat.find({},function(err,chat){
	   if(err){
		   console.log("error");
	   }else{
		   res.render("index",{chat:chat});
	   }
   });
	
		});
		// firstly write this code and after that write code for creating new post
	app.get("/index/newchat",function(_req,res){
		res.render("newchat");
	});
	// now create new route
	app.post("/index",upload.single('image'), function(req, res) {
		cloudinary.uploader.upload(req.file.path, function(result) {
			req.body.chat.image = result.secure_url;
			req.body.chat._id 
		Chat.create(req.body.chat,function(err,_newchat){
			if(err){
				res.render("newchat");
			}else{
				res.redirect("index");
			}
		});
		});
	});
// seed route
var data =[
	{
	tittle:"this mukesh for ever",
	image:"https://image.shutterstock.com/image-photo/plus-size-fashion-model-underwear-600w-626419919.jpg",
	body:"fat thigh of all time"
},
{
	tittle:"this mukesh for ever",
	image:"https://image.shutterstock.com/image-photo/happy-plus-size-fashion-model-600w-687901864.jpg",
	body:"fat thigh of all time"
}
]



// show route
app.get("/index/:id",function(req,res){
	
	Chat.findById(req.params.id).populate("comments").exec(function(err,foundchat){
		if(err){
			res.redirect("index");

		}else{
			res.render("show",{chat:foundchat});
		}
	});
});
//  edit route//

app.get("/index/:id/edit",function(req,res){
	Chat.findById(req.params.id,function(err,foundchat){
		if(err){
			res.redirect("index");
		}else{res.render("edit",{chat:foundchat});}
	});
});
// update the route
app.put("/index/:id",function(req,res){
	Chat.findByIdAndUpdate(req.params.id,req.body.chat,function(err,_updatedchat){
            if(err){
				res.redirect("/index");
			}else{
				res.redirect("/index/"+req.params.id);
			}
	});
});
// destroy routes
app.delete("/index/:id",function(req,res){
	// destroy the roooute
	Chat.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/index");
		}else{
			res.redirect("/index")
	}
	});
});

// seed
// Chat.deleteMany({},function(err){
// 	if(err){
// 		console.log(err);
// 	}console.log("removed chats");
// 	data.forEach(function(datas){
// 		Chat.create(datas,function(chatss){
// 			if(err){
// 				console.log(err);
// 			}else{
// 				console.log("chat added");
// 				// comments route
// 				Comment.create(
// 					{
// 						text: "i love u maamm",
// 						author:"rohan sharma"
// 					},function(err,comment){
// 						if(err){
// 							console.log(err)
// 						}else{
// 							chatss.comments.push(comment);
// 							chatss.save();
// 							console.log("comment add");
// 						}
					   
// 				});
// 			}
// 		});
// 	});
// });




// comments routes
app.get("/index/:id/comments/new", function(req,res){
	Chat.findById(req.params.id,function(err,chat){
         if(err){
			 console.log(err);

		 }else{
			res.render("comments/new",{chat:chat});

		 }
	});
	
});
 
app.post("/index/:id/comments",function(req,res){
	// look up index using id
	Chat.findById(req.params.id,function(err,_chat){
		if(err){
			console.log(err);
			res.redirect("index");
		}else{
			
			Comment.create(req.body.comments,function(err,comment){
                   if(err){
					   console.log(err);
				   }else{
					 _chat.comments.push(comment);
					   _chat.save();
					   res.redirect("/index"+chat._id);
					   

				   }
			});

		}
	});
	
});

app.listen(process.env.PORT||28017, process.env.IP, function(){
	
	console.log("you hit the server");
});

