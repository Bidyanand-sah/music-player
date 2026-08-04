//yaha ham electron ka 2 feature le rahe hai
const {contextBridge,ipcRenderer, autoUpdater}=require("electron");

//contextBridge renderer (HTML) ko safe tareeka se function deta hai
//"myAPI" naam se ek object banega jo window.myAPI se accessible hoga html mea
contextBridge.exposeInMainWorld("myAPI",{

    //sayHello nam ka function ban raha hai jab bhi ye call hoga ye main process ko say hello naam ka message bhej dega aur jo response aayega wahi return kar dega (promise ke through)
    selectFolder:()=>ipcRenderer.invoke("select-folder"),
    getSong:()=>ipcRenderer.invoke("get-songs"),

    onUpdateStatus:(callback)=>ipcRenderer.on("auto-update",(event,data)=>{callback(data);})

});

autoUpdater:()=>ipcRenderer.invoke("auto-updater")