const {app,BrowserWindow,ipcMain,dialog,Menu}=require("electron");
//ipcMain ye main process mea msg sunne ke liye

//fs
// const fs = require("fs").promises;
const fs = require("fs");
const fsPromises = fs.promises;

// ye preload.js ka sahi path banane ke liye chaiye
const path=require("path");

//require better-sqlite3 ka sara function nikal ke value return kar deta hia ye value ek class hota hai isi class ko ham Database variable mea store kar diye or
const Database=require("better-sqlite3");

// pahle path wale function se path pata kar lenge uske baad new Database  mea new ka matlab is class se ek naya object banao or check karta hai music.dp exist karta hai ya nahi agar karta hai to open karlo agar nahi to creatre kar leta hai or dp ke help se aab ham insert or select kar payenge

// let db=new Database(path.join(__dirname,"music.db"));

//
let db=new Database(path.join(app.getPath("userData"),"music.db"));

// Yaha mere hisab se databse ke aandar table create ho raha hai
db.exec("CREATE TABLE IF NOT EXISTS songs(id INTEGER PRIMARY KEY AUTOINCREMENT,song_name TEXT,song_path TEXT UNIQUE,cover_path TEXT,duration TEXT,artist_name TEXT)");


// ye ek function hai jo window create karke html file load karta hai
function createWindow(){
    let window=new BrowserWindow({
        width:800,
        height:600,
        webPreferences:{
            //yaha ham bata rahe hai ki window ka peoload script kaunsa hai
            preload:path.join(__dirname,"preload.js")
        }
    });
    window.loadFile("my_music.html");
}

//ye handle preload se aaya hua request pe kam karta hai yaha se request aaya to ye chalta hai

//ye ipc handle
ipcMain.handle("select-folder",async()=>{
    console.log("i am in select folder");
    let result= await dialog.showOpenDialog({
        properties:["openDirectory"]
    });
    if(result.canceled){
        return null;
    }
    // return result.filePaths[0];
    let folderPath=result.filePaths[0];//c:\\music

    let files=await fs.promises.readdir(folderPath);
    // let files = await fsPromises.readdir(folderPath);
    // return files;
    const supportedExtensions = [
    ".mp3",   // MPEG Audio
    ".wav",   // Waveform Audio
    ".flac",  // Free Lossless Audio Codec
    ".aac",   // Advanced Audio Coding
    ".m4a",   // MPEG-4 Audio
    ".ogg",   // Ogg Vorbis
    ".opus",  // Opus Audio
    ".wma",   // Windows Media Audio
    ".aiff",  // Audio Interchange File Format
    ".aif",   // AIFF Short Extension
    ".alac",  // Apple Lossless Audio Codec
    ".amr",   // Adaptive Multi-Rate
    ".ape",   // Monkey's Audio
    ".ac3",   // Dolby Digital Audio
    ".dts",   // DTS Audio
    ".mka",   // Matroska Audio
    ".mp2",   // MPEG Layer II
    ".mp1",   // MPEG Layer I
    ".oga",   // Ogg Audio
    ".ra"     // RealAudio
    ];
    let songFiles=files.filter((file)=>{
        return supportedExtensions.some((ext)=>{
            return file.toLowerCase().endsWith(ext);
        });
    });//[{music1.mp3},{music2.mp3}]

    // let fullPaths= path.join(folderPath,songFiles);
    let final=songFiles.map((song)=>{
        return  path.join(folderPath,song);
    });//[{c:\\songs\\music1.mp3},{c:\\songs\\music2.mp3}]
    // return final;
    await musicData(songFiles,folderPath);
    console.log(final);
    return final;

});


//electron ko load hone mea time lagta hai ham check kar rahe hai aap jab ready ho jaye to then mea return hoga uske baad aandar ka function call hoga then upar ka function chalega phir window bhi load ho jayega
app.whenReady().then(()=>{
  
  Menu.setApplicationMenu(null);
  app.setName("BS Music");
  createWindow();
});



//music ka metadata uthane ke liye ye library use hota hai
const mm = require("music-metadata");



async function musicData(songFiles,folderPath){
    console.log("i am in music data");
  for(const element of songFiles){
    //yaha song ka path
    let fullPath = folderPath + "/" + element;
    
    //ye function audio file ko kholta hai uske andar ka metadata padh leta hai
    let mdata= await mm.parseFile(fullPath);
    
   

    //yaha song_name set kiye
    let song_name;
    if(mdata.common.title){
      song_name=mdata.common.title;
    }else{
      song_name=path.parse(element).name;
    }

    //aab cover_image ka time
    // let coversFolder=path.join(__dirname,"covers");
    let coversFolder=path.join(app.getPath("userData"),"covers");

    if(!fs.existsSync(coversFolder)){
      fs.mkdirSync(coversFolder);
    }

      let cover_path;
      let cover_name;
      if(mdata.common.picture && mdata.common.picture.length > 0){
      let image_data = mdata.common.picture[0].data;
      let image_format=mdata.common.picture[0].format;
      cover_name=path.parse(element).name+"."+image_format.split("/")[1];

      // let coverFullPath=path.join(__dirname,"covers",cover_name);
      let coverFullPath=path.join(app.getPath("userData"),"covers",cover_name);

      if(!fs.existsSync(coverFullPath)){
        
        fs.writeFileSync(coverFullPath,image_data);
        // fs.writeFileSync("C:/XAMPP1/htdocs/Music/covers/"+cover_i,image_data);
      }

      cover_path=cover_name;

      }else{
      
        cover_path="";
      }

      //yaha duration ka kam
      let duration=mdata.format.duration;
      let duration_min= Math.floor(duration/60);
      let duration_sec=Math.floor(duration % 60);
      let secondFormat;
      if(duration_sec < 10){
        secondFormat="0"+duration_sec;
      }else{
        secondFormat=duration_sec;
      }

      let duration_format=duration_min+" : "+secondFormat;

      // artist name
      let artist_name;
      if(mdata.common.artist){
        artist_name=mdata.common.artist;
      }else{
        artist_name="Unknown Artist";
      }
      
        //aab yaha data databse mea insert karenge
        try{
          db.prepare("INSERT OR IGNORE INTO songs(song_name,song_path,cover_path,duration,artist_name)VALUES(?,?,?,?,?)").run(song_name,fullPath,cover_path,duration_format,artist_name);
          
          console.log("successfully inserted "+song_name);
        }catch(err){
          console.log("Insert failed "+err);
        }
      
  }

}
 //call
    // musicData();


ipcMain.handle("get-songs",()=>{
    console.log("i am in get song");

    let result=db.prepare("SELECT * FROM songs").all();
    const formattedSongs= result.map(song=>{
        return{
          id: song.id,
          filePath:"file://"+song.song_path,
          // coverPath:"file://"+path.join(__dirname,"covers",song.cover_path),
          coverPath:"file://"+path.join(app.getPath("userData"),"covers",song.cover_path),
          songName:song.song_name,
          duration:song.duration,
          artistName:song.artist_name

        };
      });//map end
      return formattedSongs ;

  //   return new Promise((resolve,reject)=>{
  //       db.query("SELECT * FROM `songs`",function(err,result){
  //   if(err){
  //     console.log("Some error "+err);
  //     reject(err);
  //     return;
  //   }
  //     // res.json(result);
      
  //     const formattedSongs= result.map(song=>{
  //       return{
  //         id: song.id,
  //         filePath:"file://"+song.song_path,
  //         coverPath:"file://"+path.join(__dirname,"covers",song.cover_path),
  //         songName:song.song_name,
  //         duration:song.duration

  //       };
  //     });//map end
  //     resolve(formattedSongs);
  //   });// query end

  // });//promise end
  
});








// connection closed code
// db.end();
//ye line aab use nahi hoga kuyki ye database band kar deta hai par sever to open hi rahta hai na or server wala line wait karta hai tab tak ye line database band kar deta hai