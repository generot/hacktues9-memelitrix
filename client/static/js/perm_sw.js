
async function regWorker () {
    
    const publicKey = getFromRoute(queryStringParams("http://127.0.0.1:5000/get_public",[[]]));
   
    
    navigator.serviceWorker.register("S4_sw.js", { scope: "/" });
   
   
    navigator.serviceWorker.ready
    .then(reg => {
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      }).then(
        
        sub => {
          var data = new FormData();
          data.append("sub", JSON.stringify(sub));
          fetch("/push", { method:"POST", body:data })
          .then(res => res.text())
          .then(txt => console.log(txt))
          .catch(err => console.error(err));
        },
   
        err => console.error(err)
      );
    });
  }