async function regWorker() {
	const { public: publicKey } = await getFromRoute("/getPublic");

	navigator.serviceWorker.register("/sw.js", { scope: "/" });

	navigator.serviceWorker.ready.then((reg) => {
		reg.pushManager
			.subscribe({
				userVisibleOnly: true,
				applicationServerKey: publicKey,
			})
			.then(
				(sub) => {
					var data = new FormData();
					data.append("sub", JSON.stringify(sub));
					data.append("API_key", JSON.stringify(localStorage.getItem("API_KEY")));
					fetch("/addSubToUser", { method: "POST", body: data })
						.then((res) => res.text())
						.then((txt) => {})
						.catch((err) => console.error(err));
				},

				(err) => console.error(err)
			);
	});
}
