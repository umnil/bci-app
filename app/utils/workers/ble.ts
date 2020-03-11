require('globals');
import connectionDelegate from '../ConnectionDelegate';

(global as any).onmessage = function(msg: object): void {
	let inputSettings: object = msg['data'];
	connectionDelegate.setInputSettings(inputSettings).then();
};
