async function regWorker() {
  const { public: publicKey } = await getFromRoute("http://127.0.0.1:5000/getPublic");

  navigator.serviceWorker.register("/sw.js", { scope: "/" });

  navigator.serviceWorker.ready
    .then(reg => {
      console.log(reg);
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      }).then(

        sub => {
          var data = new FormData();
          data.append("sub", JSON.stringify(sub));
          data.appent("API_key", JSON.stringify(localStorage.get("API_KEY")))
          fetch("/push", { method: "POST", body: data })
            .then(res => res.text())
            .then(txt => console.log(txt))
            .catch(err => console.error(err));
        },

        err => console.error(err)
      );
    });
}