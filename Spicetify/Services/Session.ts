// Imported Types
import type SpicetifyTypes from "../Types/App/Spicetify.ts"

// Web-Modules
import { Maid } from 'jsr:@socali/modules@^4.4.1/Maid'
import { Defer, Timeout } from 'jsr:@socali/modules@^4.4.1/Scheduler'

// Spotify Types
export type HistoryLocation = {
	pathname: string;
	search: string;
	hash: string;
	// deno-lint-ignore no-explicit-any
	state: Record<string, any>;
}

// Create our Global-Maid (keeps track of all our sub-processes)
export const GlobalMaid: Maid = new Maid()

// Development Environment Flag (useful for testing purposes)
export const IsDevelopment: boolean = import.meta.url.includes("localhost")

// Store all our Spotify Services
// deno-lint-ignore no-explicit-any
export const Spotify: typeof SpicetifyTypes = (globalThis as any).Spicetify
export let SpotifyPlayer: typeof SpicetifyTypes.Player
export let SpotifyPlatform: typeof SpicetifyTypes.Platform
export let SpotifyHistory: {
	push: ((path: HistoryLocation | string) => void);
	replace: ((path: HistoryLocation | string) => void);
	goBack: (() => void);
	goForward: (() => void);
	listen: ((listener: (location: HistoryLocation) => void) => () => void);
	location: HistoryLocation;
	entries: HistoryLocation[];
}
export let SpotifyPlaybar: typeof Spotify.Playbar
// deno-lint-ignore no-explicit-any
export let SpotifySnackbar: any
export let SpotifyInternalFetch: typeof SpicetifyTypes.CosmosAsync

// Handle Spotify loaded process
let MakeSpotifyReady: () => void
const SpotifyReadyPromise: Promise<void> = new Promise(resolve => MakeSpotifyReady = resolve)
export const OnSpotifyReady = SpotifyReadyPromise
{
	const CheckForServices = () => {
		// Update our service references
		SpotifyPlayer = Spotify.Player
		SpotifyPlatform = Spotify.Platform
		SpotifyHistory = SpotifyPlatform?.History
		SpotifyPlaybar = Spotify.Playbar
		// deno-lint-ignore no-explicit-any
		SpotifySnackbar = (Spotify as any).Snackbar
		SpotifyInternalFetch = Spotify.CosmosAsync

		// Determine if we have all our services
		if (
			(SpotifyPlayer === undefined)
			|| (SpotifyPlatform === undefined)
			|| (SpotifyHistory === undefined)
			|| (SpotifyPlaybar === undefined)
			|| (SpotifySnackbar === undefined)
			|| (SpotifyFetch === undefined)
		) {
			GlobalMaid.Give(Defer(CheckForServices))
		} else {
			MakeSpotifyReady()
		}
	}
	CheckForServices()
}

// Handle token-fetching
type TokenProviderResponse = {
	accessToken: string,
	expiresAtTime: number,
	tokenType: "Bearer"
}
let tokenProviderResponse: (TokenProviderResponse | undefined)
let accessTokenPromise: Promise<string> | undefined
export const GetSpotifyAccessToken = (): Promise<string> => {
	// Determine if we're close to refreshing (meaning we should wait until then)
	if (tokenProviderResponse !== undefined) {
		const timeUntilRefresh = ((tokenProviderResponse.expiresAtTime - Date.now()) / 1000)
		if (timeUntilRefresh <= 2) {
			tokenProviderResponse = undefined
			accessTokenPromise = (
				new Promise(resolve => GlobalMaid.Give(Timeout(timeUntilRefresh, resolve)))
				.then(
					() => {
						accessTokenPromise = undefined
						return GetSpotifyAccessToken() // This actually causes a fetch to happen
					}
				)
			)
			return accessTokenPromise
		}
	}

	// If we already have an access-token promise, return it
	if (accessTokenPromise !== undefined) {
		return accessTokenPromise
	}

	// Otherwise, fetch a new access-token
	accessTokenPromise = (
		SpotifyInternalFetch.get("sp://oauth/v2/token")
		.then(
			(result: TokenProviderResponse) => {
				tokenProviderResponse = result, accessTokenPromise = Promise.resolve(result.accessToken)
				return GetSpotifyAccessToken() // Re-run this to make sure we don't need to refresh again
			}
		)
	)
	return accessTokenPromise!
}

// Allows for Spotify API requests to be made without CosmosASYNC (which doesn't support all endpoints anymore)
export const SpotifyFetch = (url: string): Promise<Response> => {
	return (
		GetSpotifyAccessToken()
		.then(
			accessToken => fetch(
				url,
				{
					headers: {
						"Authorization": `Bearer ${accessToken}`,
						"Spotify-App-Version": SpotifyPlatform.version,
						"App-Platform": SpotifyPlatform.PlatformData.app_platform
					}
				}
			)
		)
	)
}

// Easy way to show a custom HTML notification
export const ShowNotification = (
	html: string, variant: ("info" | "success" | "warning" | "error" | "default"),
	hideAfter: number
): void => {
	SpotifySnackbar.enqueueSnackbar(
		Spotify.React.createElement(
			"div",
			{
				dangerouslySetInnerHTML: {
					__html: html.trim()
				}
			}
		), {
			variant: variant,
			autoHideDuration: (hideAfter * 1000)
		}
	)
}