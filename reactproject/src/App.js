import React,{useEffect, useState} from 'react';
import './App.css';
import {Link, Route, Switch} from 'react-router-dom';
import {useHistory} from 'react-router-dom';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios';



function App() {




  let [likes, setlikes] = useState([0,0,0]);

  let [detailnum, setdetailnum] = useState(0);

  let history = useHistory();

  let [loginModal,setloginModal] = useState(0);
  let [loginNav,setloginNav] = useState(1);

  //로그인 세션
  let [loginbox, setloginbox] = useState("");
  

  let [loginId, setloginId] = useState("");
  let [loginPw, setloginPw] = useState("");
  function login(){
    
    axios.post('/login',{loginId : loginId , loginPw : loginPw}).then(function(result){
      if(result.data == 0){
        alert('반갑습니다.')
        window.location.href='/';
      }else{
        alert('아이디나 비밀번호가 잘못되었습니다. 다시입력해주세요')
      }
    })


  }



  //회원가입 아이디
  let [registerId ,setregisterId] = useState("");
  let [registerPw, setregisterPw] = useState("");
  let [registerName,setregisterName] = useState("");
  let [registerPhone,setregisterPhone] = useState("");
  // let [registerCheck, setregisterCheck] = useState(0);
  function register(){
    
    axios.post('/register',{registerId : registerId , registerPw : registerPw,registerName : registerName,registerPhone : registerPhone}).then(function(result){
      if(result.data==1){
        alert('이미 사용중입니다. 다른아이디를 입력해주세요')
      }else if(result.data ==0){
        alert('아이디는 영어와 숫자만 사용해주세요');
      }else{
        alert('회원가입을 축하드립니다. 로그인해주세요')
        window.location.href= '/'
      }
      
    }

    )    
  }



  //subDrop
  let [subDrop, setsubDrop] = useState(0);
  function dropbox(){
    if(subDrop ===0){
      setsubDrop(1);
    }
    else{
      setsubDrop(0);
    }
  }

  //글작성 state
  const [writeInput, setWriteinput] = useState({
    title : '',
    내용 : '',
  });
  const {title , 내용} = writeInput;
  function writeChange (e){
    const{value , name} = e.target;
    setWriteinput({
      ...writeInput,
      [name]:value
    })
  }

  function likePlus(i){
    var newArray = [...likes];
    newArray[i] = newArray[i] + 1;
    setlikes(newArray);
  }

  function writeboxPush(){
    axios.post('/write',
      {
        title : writeInput.title,
        내용 : writeInput.내용
        
      }
    ).then(function(response){
      var newArray = [...title1];
      newArray.push(response.data);
      settitle1(newArray);
    })
    history.goBack();
  }


  let [title1 , settitle1] = useState([]);
  useEffect(()=>{
      axios.get('/data').then(function(response){
        var newArray = [...title1];
        newArray.push(...response.data);
        settitle1(newArray);
        
      })
    },[])

  let [myList, setmyList] = useState([]);
  useEffect(()=>{
    axios.get('/mypageList').then(function(response){
      var newArray = [...myList];
      newArray.push(...response.data);
      setmyList(newArray);
    })
  },[title1])

  useEffect(()=>{
      axios.get('/loginNav').then(function(response){
        setloginNav(response.data)
      })

    },[])

  function reload(){
    alert('로그아웃성공')
    window.location.reload();
  }

  function logout(){
    axios.get('/logout').then(function(){
      reload()
    })
  }

  useEffect(()=>{
    axios.get('/loginNav').then(function(response){
    axios.get('/loginbox').then(function(result){
      var newArray = [...loginbox];
      newArray = result.data;
      setloginbox(newArray);
    })
    })

  },[])


  //검색기능

  let [search , setsearch] = useState([0]);
  let [searchreturn, setsearchretrun] = useState([]);

    //input에 입력될 때마다 account state값 변경되게 하는 함수
    function 검색(){
      axios.get('/search',{params : {searchdata : search}}).then(function(result){
        var newArray = [...searchreturn];
        newArray = result.data;
        setsearchretrun(newArray);
      })
    }
    ;
    //세부페이지
    let [detailP , setdetailP] = useState([]);
    function detailPage(id){
      axios.get('/detailPage',{params : {id : id}}).then(function(result){
        var newArray = [];
        newArray = result.data;
        setdetailP(newArray);
        history.push("/detail/"+detailP._id);
      })
    }

    //글삭제
    
    function deletep(_id){
      axios.post('/deletep',{id:_id}).then(function(result){
        if(result.data == 1 ){
          alert('글이 삭제되었습니다.');
          window.location.reload();
        }
      })
    }
    
    //내정보 수정
    let [updateModal,setupdateModal] = useState(0);
    let [updateName,setupdateName]= useState('');
    let [updatePhone,setupdatePhone]= useState('');
    function clientSet(){
      axios.post('/clientUpdate',{id : loginbox.id , name : updateName , phone : updatePhone}).then(function(result){
        if(result.data == 1){
          alert('수정할 이름을 입력해주세요')
        }else if(result.data ==2 ){
          alert('수정할 전화번호를 입력해주세요')
        }else{
          alert('수정되었습니다.');
          window.location.reload();
          
        }
      })
    };

  
  
  return (

    
        <div className="App">
          <div className='main-container'>
                  <div className='black-nav'>
                    <Link to="/" className='text-link '><div>개발 Blog</div></Link>
                    <div className='nav-menu'>
                        
                      {loginNav === 1 ?
                        <div onClick={()=>{setloginModal(1)}}>로그인</div>
                        :loginNav === 2 ?
                        <div className='login-nav'>
                          <Link to="/search" className='text-link' ><div>🍳</div></Link>
                          <Link to="/write" className='text-link'><div>글쓰기</div></Link>
                          <div onClick={()=>{logout()}}>로그아웃</div>
                          <div onClick={()=>{dropbox()}}>
                          <div>{loginbox.id} 
                          </div>
                          {
                            subDrop === 1?
                           
                            <div className='subDrop'>
                               
                            <Link to="/myPage1"><p>내글보기</p></Link>
                            <Link to="/myPage2"><p>내정보보기</p></Link>
                            
                          </div>
                          :null
                          }
                          </div>
                        </div>
                        :null
                      }
                      
                    </div>
                  </div>
                  <div>
                    {
                      loginModal === 1 ?
                        <div className='login'>

                          <div className='login-img'>
                            <img src="./upload/welcome.jpg" alt="아직없음 환영한다고해" />
                          </div>
                          <div className='login-right'>
                              <div className='login-title'>로그인</div>
                              <div className='login-input'>
                                <input type="text" placeholder='아이디' required name="loginId" onChange={(e)=>{setloginId(e.target.value)}} />
                                <input type="password" placeholder='비밀번호' required name='loginPw'onChange={(e)=>{setloginPw(e.target.value)}}/>
                              </div>
                                <input type='submit' id='login-btn' value={"로그인"} onClick={()=>{login()}}/>
                            <div className='register'>
                              아직 회원이 아니신가요?<button onClick={()=>{setloginModal(2)}}>회원가입</button>
                            </div>
                            <button className='close-btn' onClick={()=>{setloginModal(0)}}>닫기</button>
                          </div>
                          
                        </div>
                        : loginModal === 2 ?
                        <div className='login'>
                          <div className='registerDiv'>
                            <h3>회원가입</h3>
                            <input type="text" name='id' className='registerId' onChange={(e)=>{setregisterId(e.target.value)}} required placeholder='아이디를 입력하세요'/>
                            <input type="password" name='pw' className='registerPw' onChange={(e)=>{setregisterPw(e.target.value)}} required placeholder='비밀번호를 입력하세요'/>
                            <input type="text" name='name'onChange={(e)=>{setregisterName(e.target.value)}} required placeholder='이름을 입력하세요'/>
                            <input type="text" name='phone' onChange={(e)=>{setregisterPhone(e.target.value)}} required placeholder='전화번호를 입력하세요'/>
                            <input type='submit' className='registerClick' value={"회원가입"} onClick={()=>{register()}} />
                            <button className='close-btn' onClick={()=>{setloginModal(0)}}>닫기</button>
                          </div>
                        </div>
                      :null
                    }
                  </div>
          <Switch>
            <Route exact path="/">
                  <div className='list'>
                    {title1.map(function(a,i){
                      return(
                        <div className='list-child' key={i} onClick={()=>{detailPage(a._id)}}>
                            <div className='list-img'>
                            <img src="./noimage.jpg"/>
                            </div>
                            <h3>{a.title} <span onClick={()=>{likePlus(i)}}>🙋‍♀️</span><span>{likes[i]}</span></h3>
                            <p>날짜 : {a.date}</p>
                            <p>{a.내용}</p>
                        </div>
                      
                       )
                    })}
                  </div>
              </Route>
              <Route exact path="/write">
                <div className='write'>
                  <div className='write-box'>
                    <input className='writeinput-title' name="title" placeholder="제목을 입력하세요"
                    onChange={(e)=>{writeChange(e)}} />
                    <div className='hr'></div>
                    <textarea className='writeinput-content' name="내용" placeholder='하고싶은말'
                    onChange={(e)=>{writeChange(e)}} />
                    <button className='writebutton' onClick={()=>{writeboxPush()}}>작성</button>
                  </div>
                  <div className='writing-title'>
                    <div className='write-title-input'>
                      <input type="text" className='write-title-input-title'  value={writeInput.title}/>
                    </div>
                    <div className='write-content-input'>
                      
                      <textarea className='write-title-input-content' value={writeInput.내용}/>
                    </div>
            
                  </div>
                </div>
                
              </Route>  
              
              <Route path="/detail/:id">
                <Detailpage title = {title1} detailnum = {detailnum+1} detailP = {detailP}></Detailpage>                
              </Route>
              
              <Route path="/search">
                    
                      <div className='searchinput'>
                        <input type="text"  onChange={(e)=>{
                          setsearch(e.target.value);
                        }}/>
                      </div>
                      <input className='searchinput-click'  type="button"  value="검색" onClick={()=>{검색()}} />
                    <div>
                        {
                          searchreturn.map(function(a,i){
                            return(
                              <div className='search-list'>
                                <div className='list-child' key={i} onClick={()=>{detailPage(a._id)}}>
                                  <div className='list-img'>
                                  <img src="./noimage.jpg"/>
                                  </div>
                                  <h3>{a.title} <span onClick={()=>{likePlus(i)}}>🙋‍♀️</span><span>{likes[i]}</span></h3>
                                  <p>날짜 : {a.date}</p>
                                  <p>{a.내용}</p>
                                </div>
                              </div>
                        
                          )})
                        }
                      </div>
                    
              </Route>
              
              <Route path="/myPage1">
                    <div>

                    </div>
                    <div className='myPage-background'>
                      <div className='myPage-Id'>
                        {loginbox.id} Blog
                      </div>
                      <div>
                        <div>
                        <div className='myPagelistbox'>
                        {myList.map(function(a,i){
                          return(
                            <div className='myPagelist' key={i}>
                                <h3>{a.title} <span onClick={()=>{likePlus(i)}}>🙋‍♀️</span><span>{likes[i]}</span></h3>
                                <a>작성일 : {a.date}</a>
                                <p>{a.내용}</p>
                                <div className='myPageoption'>
                                  <p className='delete-btn' onClick={()=>{deletep(a._id)}}>글삭제</p>
                                </div>
                            </div>
                          
                          )
                        })}
                        </div>
                      </div>
                        <div>
                          이메일 주소 : forfila@naver.com
                        </div>
                      </div>
                    </div>
                    
              </Route>
              <Route path="/myPage2">
                  <div className='myPage2'>
                        <h3>내정보</h3>
                        
                          {updateModal ==0?
                          <div className='clientset'>
                            <div className='clientsetline'>                          
                              <p>아이디</p>
                              <div>{loginbox.id}</div>
                            </div>
                            <div className='clientsetline'>
                              <p>이름</p>
                              <div>{loginbox.name}</div>
                            </div>
                            <div className='clientsetline'>
                              <p>전화번호</p>
                              <div>{loginbox.phone}</div>
                            </div>
                            <input type="button" value={'정보수정'} onClick={()=>{setupdateModal(1)}}/>
                          </div>
                          :updateModal ==1?
                          <div className='clientset'>
                            <div className='clientsetline'>
                              <p>아이디</p>
                              <div>{loginbox.id}</div>
                            </div>

                            <div className='clientsetline'>
                              <p>이름</p>
                              <input type="text" name='name'onChange={(e)=>{setupdateName(e.target.value); console.log(updateName)}} required Value={loginbox.name}/>
                            </div>
                            <div className='clientsetline'>
                              <p>전화번호</p>
                              <input type="text" name='phone' onChange={(e)=>{setupdatePhone(e.target.value); }} required Value={loginbox.phone}/>
                            </div>
                            <input type="button" className='client-btn' value={'수정완료'} onClick={()=>{clientSet();}}/>
                            <input type="button" className='client-btn' value={'취소'} onClick={()=>{setupdateModal(0)}}/>
                          </div>
                          :null
                          }
                        
                  </div>
              </Route>

         </Switch>
        </div>
      </div>
  );
}

function Detailpage(props){
  let id = useParams();
  console.log(id)
  return(
    <div className='detailPage'>
      {/* <h3>{props.title[id.id].title}</h3> */}
      {/* <p>{props.title[id.id].date}</p> */}
      {/* <p>{props.title[id.id].내용}</p> */}
      <h3>{props.detailP.title}</h3>
      <p>{props.detailP.date}</p>
      <p>{props.detailP.내용}</p>
    </div>
  )
}
{/* /* 
function myPage(props){

  return(
    <div className='myPagedetail'>
      <h3>{props.title[id.id].title}</h3>
      <p>{props.title[id.id].date}</p>
      <p>{props.title[id.id].내용}</p>
    </div>
  )
} */}

export default App;
