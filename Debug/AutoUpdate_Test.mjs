// Define our port
const Port = -1 // This is replaced by the build-script

// Handle version updating
const QueuedVersionImports = []
let currentVersion, importing = false
let activeMaid, activeStyling
const UpdateVersion = (version) => {
	// First, make sure that we aren't updating to the current version
	if ((version === currentVersion) || QueuedVersionImports.includes(version)) {
		return
	} else if (importing) {
		QueuedVersionImports.push(version)
		return
	}

	// Update our state
	importing = true
	currentVersion = version

	// Clean-up our previous imports
	{
		if (activeMaid !== undefined) {
			activeMaid.Destroy()
			activeMaid = undefined
		}

		if (activeStyling !== undefined) {
			activeStyling.remove()
			activeStyling = undefined
		}
	}

	// Create our style immediately
	{
		activeStyling = document.createElement("link")
		activeStyling.rel = "stylesheet"
		activeStyling.href = `http://localhost:${Port}/bundle@${version}.css`
		document.body.appendChild(activeStyling)
	}

	// Handle importing process
	{
		import(`http://localhost:${Port}/bundle@${version}.mjs`)
		.then(
			module => {
				// Handle our module
				activeMaid = module.default

				// Update our state
				importing = false

				// Check if we have any queued imports
				if (QueuedVersionImports.length > 0) {
					UpdateVersion(QueuedVersionImports.shift())
				}
			}
		)
	}
}

// Now handle receiving our version updates
{
	const webSocket = new WebSocket(`ws://localhost:${Port}/ws`)
	webSocket.onmessage = event => UpdateVersion(event.data)
	webSocket.onclose = () => console.log("STOPPED AUTO-UPDATING!")
	webSocket.onopen = () => webSocket.send("")
}