// const { response } = require("express");
// const { error } = require("node:console");

let updateStatusText=document.getElementById("updateStatusText");
let updateProgressBar=document.getElementById("updateProgressBar");
window.myAPI.onUpdateStatus((data)=>{
  switch(data.status){
    case "checking":{
      updateStatusText.innerText="Checking for Updates..";
      break;
    }
    case "available":{
      updateStatusText.innerText="Update available,Downloading";
      break;
    }
    case "not-available":{
      updateStatusText.innerText="App is up to date";
      break;
    }
    case "downloading":{
      updateStatusText.innerText="Downloading.."+data.percent + "%";
      updateProgressBar.value=data.percent;
      break;
    }
    case "downloaded":{
      updateStatusText.innerText="Update ready! Restart to Apply.";
      break;
    }
    case "error":{
      updateStatusText.innerText="Something went wrong while Updating . "+ data.message;
      break;
    }
  }
});

// yaha multipal songs story hai
  let songs=[];

//client-id
const clientId="70f2ad57";

//searchInput and searchButton select
let searchInput=document.getElementById("searchInput");
let searchButton=document.getElementById("searchButton");


searchButton.addEventListener("click",async()=>{
  if(!mySong.paused){
    mySong.pause();
    playButton.classList.remove("fa-pause");
    playButton.classList.add("fa-play");
    mySong.currentTime=0;
    document.getElementById("currentTime").innerText="00 : 00";
    document.getElementById("totalDuration").innerText="00:00";
  }
  if(searchInput.value){
    let searchValue=searchInput.value;
    let r=`https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=21&namesearch=${encodeURIComponent(searchValue)}`;
  
    let result=await fetch(r).then((response)=>{
      return response.json();
    }).catch((error)=>{
      console.log("Data not Fetch"+error);
    });

    if(result==undefined){
      document.getElementById("songItemContainer").innerHTML=`<p>Search Issuse</p>`;
      searchInput.value="";
    }else if(result.headers.status !== "success"){
      document.getElementById("songItemContainer").innerHTML=`<p>Technical Problem ${result.headers.error_message}</p>`;
      console.log(result.headers);
      searchInput.value="";
    }else if(result.results.length===0){
      console.log(result.headers);
      songs=[];
      document.getElementById("songItemContainer").innerHTML=`<p>No Songs Found</p>`;
      searchInput.value="";
    }else{
    songs=result.results.map(song=>{
      let min=Math.floor(song.duration/60);
      let sec=Math.floor(song.duration%60);
      let finalDuration=min+" : "+sec;
      return{
        songName:song.name,
        artistName:song.artist_name,
        coverPath:song.album_image,
        filePath:song.audio,
        duration:finalDuration,
        shareUrl:song.shareurl
      }
    });
    loadSongs();
    searchInput.value="";
  }
  }
});



// ye variable current song ka position yaad rakhega
let currentSongIndex = 0;

window.addEventListener("DOMContentLoaded",async()=>{
  songs=await window.myAPI.getSong();

  //page load hote hi check kar rahe hai previous volume kitna tha so
  let savedVolume=localStorage.getItem("volume");

  if(savedVolume !== null){
    volumeBar.value=savedVolume;
    mySong.volume=volumeBar.value/100;
  }else{
    mySong.volume=volumeBar.value/100;
  }

  loadSongs();
});

//current time and total time print karna

let currentTime=document.getElementById("currentTime");
let totalDuration=document.getElementById("totalDuration");


async function loadSongs(){
  
//ye
let allSongsHtml="";

//yaha ham har song ke liye html design karenge
songs.forEach((song,index)=>{
  // let songName=path.basename(song);
  let s=`<div class="songItem">
            <img src="${song.coverPath}" onerror="this.onerror=null; this.src='fixed-cover.jpg'">

          
            ${song.shareUrl ? `<i class="fa-solid fa-arrow-up-right-from-square shareIcon" ></i>` : ""}
            

            <span class="songName">${song.songName} 
            </span>

            <span class="artistName">${song.artistName}
            </span>

            <span class="songListPlay">
                <span class="timeStamp">${song.duration}
                </span>
            </span>
          </div>    
  `;
  
allSongsHtml+=s;
});

// ${song.shareUrl ? `<i class="fa-solid fa-arrow-up-right-from-square" id="shareIcon"></i>` : ""}
// yaha backticks ke andar ham backticks ku use kiye agar ham double use karte class ka double quote or pura string double quote mea to dono confilct ho sakta tha isiliye ek change kiye



//yaha songka html jis container mea hai usko pakad rahe hai
document.getElementById("songItemContainer").innerHTML=allSongsHtml;

// ye return kiya sara div jiska class hai songItem or ye array ke form mra nahi deta jo ham oprection kar le ye deta hai HTML collection mea
let song_div=document.getElementsByClassName("songItem");

//array.form kya karta hai
// "Jo bhi collection diya hai, uska ek naya Array bana do."
let songItem=Array.from(song_div);

songItem.forEach(function (element, index) {
  element.getElementsByTagName("img")[0].src = songs[index].coverPath;
  element.getElementsByClassName("songName")[0].innerText =songs[index].songName;
  element.getElementsByClassName("artistName")[0].innerText=songs[index].artistName;
  element.getElementsByClassName("timeStamp")[0].innerText=songs[index].duration;
  
  let shareUrl=element.getElementsByClassName("shareIcon")[0];

if(shareUrl){
shareUrl.addEventListener("click",(event)=>{
  event.stopPropagation();
  window.open(songs[index].shareUrl,"_blank");
});
}
  
  

  // pata karne ko ki kon se songs pe click hua hai
  element.addEventListener("click", function () {
    //yaha ham jo object banaye the new Audio se uske value mea aapna value rakh rahe hai aab mera src jo abhi rakhe wo chala gaya aab jo src gaya usko play kar denge
    mySong.src = songs[index].filePath;
    mySong.play();
    playButton.classList.remove("fa-play");
    playButton.classList.add("fa-pause");

    // buttom mea kon sa song play ho raha hai uska name yaha change ho raha hai
    songInfoName.innerText = songs[index].songName;

    //gif ko yaha play karna
    gif.style.opacity = "1";

    //yaha se us song ka duration utha ke totalDuration mea print kar denge
    totalDuration.innerText=songs[index].duration;

    //ham yaha currentSongIndex variable ko bata rahe hai ki mera ye index ka song baj raha hai
    currentSongIndex = index;
  });
});

}//async function loadSong ka end





// ye line se ham check kiye console mea print ho raha hai ya nahi
console.log("Hello music Player");
// yaha pe hamne ye song ko select kiya or usko Audio naam ka object ko diye ye predefine object hai aab ham is object ka property use kar sakte hai
// let mySong = new Audio("songs/music1.mp3");
let mySong = new Audio();

//yaha hamne play button ko select kiye
let playButton = document.getElementById("Play");

// yaha ham next button ko select karenge
let next = document.getElementById("next");

// yaha ham previous button ko select karenge
let previous = document.getElementById("previous");




//yaha ham check kiye ki play button sahi mea select hua ya nahi agar hua hoga to click karne pe console mea print hoga
console.log(playButton);

//yaha hamne button pe event lagaye ki click karne pe mere dwara banaya gaya function kam kare
playButton.addEventListener("click", function () {
  if (mySong.paused) {
    mySong.play();
    playButton.classList.remove("fa-play");
    playButton.classList.add("fa-pause");
    totalDuration.innerText=songs[currentSongIndex].duration;
  } else {
    mySong.pause();
    playButton.classList.remove("fa-pause");
    playButton.classList.add("fa-play");
  }
});

// yaha hamne progress bar ko select kiye jisse aage use kar sake
let myProgressBar = document.getElementById("myProgressBar");

// yaha hamne buttom bar mea song name jaha hota hai usko select kiyr hai naam change karne ko jise corrent song name dikhe
let songInfoName = document.getElementById("songInfoName");

// yaha gif ko select kar rahe hai jisko song play hone pe dikhaya ja sake
let gif = document.getElementById("gif");




// hamko progressbar ko slide karwana hai to mySong mea karna hai to uske pass ek event listner hai timeupdate jo haar time active hota hai or hamne isko function ke sath joda to function automaticaly call ho raha hai timeupdate ke karan or haar second update ho raha hai progress bar

mySong.addEventListener("timeupdate", function () {
  // kitna percentage song baja ye wo batata hai
  let percentage = (mySong.currentTime / mySong.duration) * 100;

  // ye value set karta hai
  myProgressBar.value = percentage;

  let min=Math.floor(mySong.currentTime/60);
  let sec=Math.floor(mySong.currentTime%60);

  if(min < 10){
    if(sec < 10){
      currentTime.innerText="0"+min+" : "+"0"+sec;
    }else{
      currentTime.innerText="0"+min+" : "+sec;
    }
  }else{
    if(sec < 10){
      currentTime.innerText=min+" : "+"0"+sec;
    }else{
      currentTime.innerText=min+" : "+sec;
    }
  }

});



//agar ham chahe ki progress bar ko aage kar de kuyki mere maan hai aage ka gana sunne ka to ye change event mere current progress bar ka value leta hao or son ko bata deta hai ki user ke value pe chalo
myProgressBar.addEventListener("change", function () {
  mySong.currentTime = (myProgressBar.value * mySong.duration) / 100;



});

//song khatam hone pe icon change karna or progress bar ko 0 pe set karna
mySong.addEventListener("ended", function () {
  

  if( songs.length -1 == currentSongIndex){
    playButton.classList.remove("fa-pause");
  playButton.classList.add("fa-play");
  myProgressBar.value = 0;
  currentTime.innerText="00 : 00";
  totalDuration.innerText="00:00";
  }else{

  if (currentSongIndex < songs.length -1) {
    currentSongIndex = currentSongIndex + 1;

    playSong();
    
  }
}


});


// ye function banaya gaya hai jisse next or previous ka code chota kiya ja sake
function playSong(){
mySong.src = songs[currentSongIndex].filePath;
    mySong.play();

    playButton.classList.remove("fa-play");
    playButton.classList.add("fa-pause");

    songInfoName.innerText = songs[currentSongIndex].songName;
    gif.style.opacity = "1";

  totalDuration.innerText=songs[currentSongIndex].duration;

}

next.addEventListener("click", () => {
  if (currentSongIndex < songs.length -1) {
    currentSongIndex = currentSongIndex + 1;

    playSong();
    
  } else {
    currentSongIndex = 0;
    playSong();
  }
});

// yaha ham event lagayenge jo previous button pe cick karne pe gana back kar de

previous.addEventListener("click", () => {
  if (currentSongIndex > 0) {
    currentSongIndex--;
    playSong();
  } else {
    currentSongIndex = songs.length - 1;
    playSong();
  }
});

//data fetch karne ka khuch code
let selectFolder=document.getElementById("selectFolder");

selectFolder.addEventListener("click",async ()=>{
  
  let selectF=await window.myAPI.selectFolder();
  if(selectF===null){
    console.log("Select Folder First");
    return;
  }
  // songs=selectF;
  console.log("i am in script.js inside the click to select folder \n",selectF);
  // songs = selectF;
  songs=await  window.myAPI.getSong();
  console.log("get song end in the select folder");

  //check karega pahle se koi song nahi na chal raha hai chal raha hai to usko pause karke sabkhuch reset kar dega
  if(!mySong.paused){
    mySong.pause();
    playButton.classList.remove("fa-pause");
    playButton.classList.add("fa-play");
    mySong.currentTime=0;
    document.getElementById("currentTime").innerText="00 : 00";
    document.getElementById("totalDuration").innerText="00:00";

  }

  loadSongs();
});

//volume set karna

let volumeBar=document.getElementById("volumeBar");

// mySong.volume=volumeBar.value/100;

volumeBar.addEventListener("input",()=>{
  
  mySong.volume=volumeBar.value/100;

  //naya volume ko localStorage mea save kar do 
  localStorage.setItem("volume",volumeBar.value);
  
});

//update bar code
let updateIcon=document.getElementById("updateIcon");
let updatePage=document.getElementById("updatePage");
let closeUpdatePage=document.getElementById("closeUpdatePage");

updateIcon.addEventListener("click",()=>{
  updatePage.style.display="flex";
});

closeUpdatePage.addEventListener("click",()=>{
  updatePage.style.display="none";
});
