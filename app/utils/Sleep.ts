export default async function sleep(timeout: number): Promise<void> {
	await new Promise<void>(resolve=>setTimeout(resolve, timeout));
}
