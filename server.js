const express = require('express');
const path = require('path');
const app = express();
const MongoClient = require('mongodb').MongoClient;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
const http = require('http').createServer(app);
app.use(express.json());
var cors = require('cors');
app.use(cors());

//passport 설치
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true,saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());




let multer = require('multer');
let today = new Date();
let year = today.getFullYear(); // 년도
let month = today.getMonth() + 1;  // 월
let date = today.getDate();  // 날짜
let day = today.getDay(); 

let time = year+"+"+month+"+"+date;
const req = require('express/lib/request');
const flash = require('connect-flash/lib/flash');
var storage = multer.diskStorage({
  destination : function(req,file,cb){
    cb(null, './reactproject/public/upload')
  },
  filename : function(req, file ,cb){
    cb(null,time+file.originalname)
  },
  filefilter : function(req,file,cb){
    var ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        return callback(new Error('PNG, JPG만 업로드하세요'))
    }
    callback(null, true)
  }
});

var upload = multer({storage : storage});



var db;
MongoClient.connect('mongodb+srv://admin:dlwnsdn123@cluster0.1dazw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{ useUnifiedTopology: true }, function(err, client){
  if (err) return console.log(err);
  db = client.db('project')
  
  http.listen(8070, function () {
    console.log('listening on 8080')
  }); 
  
})


app.use(express.static(path.join(__dirname, 'reactproject/build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/reactproject/build/index.html'));
});




//로그인
app.post('/login', passport.authenticate('local', {failureRedirect : '/fail'}),function(req , res){
  db.collection('register').findOne({id : req.body.loginId},function(err,result){
    if(result.id == req.body.loginId){
      db.collection('registerNav').find().toArray().then(result =>{
        var logincount = [...result];
        if(logincount[0].count== 1){
          db.collection('registerNav').updateOne({name : 'logincount'},{ $inc :{count:1}},function(에러,결과){
            res.json(0);
           })
          }
        })
    }else{
      res.json(1);
    }
  })

  

  


}) 

//로그인Nav 변경
app.get('/loginNav',function(req,res){
  db.collection('registerNav').find().toArray().then(result =>{
    var logincount = [...result];
    res.json(logincount[0].count)
  })

})

//로그아웃
app.get('/logout', function(req,res){
  req.logout();
  db.collection('registerNav').find().toArray().then(result =>{
    var logincount = [...result];
    if(logincount[0].count== 2){
      db.collection('registerNav').updateOne({name : 'logincount'},{ $inc :{count:-1}},function(에러,결과){
        req.session.destroy(function(){
          res.cookie('connect.sid','',{maxAge:0}) 
          res.redirect('/');
          })
        })
        
      }
      
    })

});
 

//로그인 중복체크

function logincheck(req,res, next){
  if(req.user){
    next()
  } else{
    res.send('<script>alert("로그인을 해주세요"); window.location.href = "/";</script>')
  }
}




passport.use(new LocalStrategy({
  usernameField: 'loginId',
  passwordField: 'loginPw',
  session: true,
  passReqToCallback: false,
}, function (id, pw, done) {
  db.collection('register').findOne({ id: id }, function (err, result) {
    if (err) return done(err)
    if (!result) return done(null, false, { message: '없는아이디 입니다' })
    if (pw == result.비밀번호) {
      return done(null, result);
    } else {
      return done(null, false, { message: '비밀번호오류' })
    }
  })
}));


//위의 결과가 user로 들어옴
passport.serializeUser(function(user,done){
  done(null,user.id)
});

//이세션 데이터로 DB에서 찾는법
passport.deserializeUser(function(id,done){
  // DB에서 위에서 있는 USER.ID 로 유저를 찾은 뒤에 유저 정보를  {} 에 넣음
  db.collection('register').findOne({id : id},function(err, result){
    done(null,result)
  })
  
});

//로그인 아이디비밀번호 보내주기
app.get('/loginbox',function(req,res){
  db.collection('register').find({id : req.user.id}).toArray().then(result=>{
    console.log(result[0].id);
    var loginbox = result[0];
    res.json(loginbox);
  })
  
}) 
  




//회원가입
app.post('/register', function(req,res){
  db.collection('registerCount').findOne({name:"아이디번호"},function(err, result){
    var totalId = result.totalId;
    db.collection('register').findOne({id: req.body.registerId},function(err,result){
        //아이디 중복검사먼저 정규식
        var engNum =  /^[a-zA-Z0-9]*$/;
        if(engNum.test(req.body.registerId)){
          if(result == null){
            db.collection('register').insertOne({id: req.body.registerId, 비밀번호 : req.body.registerPw ,_id : totalId , name : req.body.registerName, 
              phone : req.body.registerPhone}, function(err,result){
                  db.collection('registerCount').updateOne({name : '아이디번호'},{ $inc :{totalId:1}},function(err,result){
                    if(err){
                        return console.log(err)
                    }else{
                        res.send('<script>alert("회원가입을 축하합니다."); window.location.href = "/";</script>')
                    }
                  })
                })
          }else{
            var registerNum = 1;
            res.json(registerNum)
          }
        }else{
          var fail = 0;
          res.json(fail);
        }

    })

  })


});

//회원정보수정
app.post('/clientUpdate',function(req,res){
    if(req.body.name == ''){
      res.json(1);
    }else if(req.body.phone == ''){
      res.json(2);
    }else{
      db.collection('register').updateOne({id : req.body.id},{$set: {name : req.body.name , phone : req.body.phone}},function(err,result){
        res.json(3);
    })
      
    }
    

  
})


//글작성
app.post('/write',function(req,res){
  db.collection('counter').findOne({name:'게시물갯수'},function(err,result){
    var userNum =req.user._id;
    var totalPost = result.totalPost;
    var writePost = {_id: totalPost+1, title:req.body.title , 내용:req.body.내용 , date : new Date().toLocaleDateString(),usernum : userNum}
    console.log(writePost)
    db.collection('post').insertOne(writePost,function(err,result){
        db.collection('counter').updateOne({name : '게시물갯수'},{ $inc :{totalPost:1}},function(err,result){
          if(err){
              return console.log(err)
          }else{
              db.collection('post').find().toArray().then((result)=>{
                res.json(result[result.length-1])
              })
          }
      })
    })
  })

})

//글삭제
app.post('/deletep',function(req,res){
  db.collection('post').deleteOne({_id:req.body.id}).then((result)=>{
    var deleteNum = 1;
    res.json(deleteNum);
  })
})


//메인페이지 글보내주기
app.get('/data',function(req,res){
  db.collection('post').find().toArray().then((result)=>{
    res.json(result)
  })
})
//마이페이지 내글보기
app.get('/mypageList',function(req,res){
  var user_id = req.user._id;
  db.collection('post').find({usernum : user_id}).toArray().then((result)=>{
    res.json(result)
  })
})

//검색
app.get('/search',function(req,res){
  var sTitle = req.query.searchdata;
  var searchCondition = [{
    $search:{
      index: 'titleSearch',
      text:{
        query: sTitle,
        path:'title'
      }
    }
  }]
    db.collection('post').aggregate(searchCondition).toArray((err,result)=>{
      res.json(result);
    })
})

//세부페이지
app.get('/detailPage',function(req,res){
  var id = parseInt(req.query.id);
  
  db.collection('post').findOne({_id : id},function(err,result){
    res.json(result);
  })
})

// react router
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '/reactproject/build/index.html'));
});