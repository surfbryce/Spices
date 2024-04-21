/*
// Handle getting our version
type Version = {
	Text: string;

	Major: number;
	Minor: number;
	Patch: number;
	Control?: number;
}

const GetVersionInformation = (text: string): (Version | undefined) => {
	const versionMatches = text.match(/(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?/)

	if (versionMatches === null) {
		return undefined
	}

	return {
		Text: versionMatches[0],

		Major: parseInt(versionMatches[1]),
		Minor: parseInt(versionMatches[2]),
		Patch: parseInt(versionMatches[3]),
		Control: (versionMatches[4] ? parseInt(versionMatches[4]) : undefined)
	}
}

const GetVersionDistance = (fromVersion: Version, toVersion: Version): [Version, boolean] => {
	const versionDistance = {
		Text: "",

		Major: (toVersion.Major - fromVersion.Major),
		Minor: (toVersion.Minor - fromVersion.Minor),
		Patch: (toVersion.Patch - fromVersion.Patch),
		Control: (
			((toVersion.Control === undefined) && (fromVersion.Control === undefined)) ? 0
			: (toVersion.Control === undefined) ? fromVersion.Control
			: (fromVersion.Control === undefined) ? fromVersion.Control
			: (toVersion.Control - fromVersion.Control)
		)
	}

	return [
		versionDistance,
		(
			(versionDistance.Major !== 0)
			|| (versionDistance.Minor !== 0)
			|| (versionDistance.Patch !== 0)
			|| (versionDistance.Control! !== 0)
		)
	]
}

// Grab the distance between versions
		const [versionDistance, isDifferent] = GetVersionDistance(ExtensionVersion, cachedVersion)

		// Make sure that we have a difference in version AND that we aren't below the first auto-update version
		if (
			isDifferent
			&& ((cachedVersion.Major > 2) || ((cachedVersion.Major == 2) && (cachedVersion.Minor >= 4)))
		) {
			// Now send out the notifcation
			ShowNotification(
				`<h3>Beautiful Lyrics Updated!</h3>
				<h4 style = 'margin-top: 4px; margin-bottom: 4px; font-weight: normal;'>No need to re-install - it's already running!</h4>
				<span style = 'opacity: 0.75;'>Version ${ExtensionVersion.Text} -> ${cachedVersion.Text}</span>`,
				(
					(versionDistance.Major > 0) ? "success"
					: (
						(versionDistance.Major < 0)
						|| (versionDistance.Minor < 0)
						|| (versionDistance.Patch < 0)
					) ? "warning"
					: "info"
				),
				JustUpdatedNotificationLifetime
			)

			// Obviously we should return here
			return ApplyUpdate(text)
		}
*/