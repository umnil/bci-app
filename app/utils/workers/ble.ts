require('globals');

export interface WorkerMessage {
	type: string;
	data: object;
}

(global as any).onmessage = function(msg: WorkerMessage): void {
	console.log('Hi!');
};
