import { Wallet } from 'src/app/interface/data';
import { environment } from 'src/environments/environment';

type StakeData = {
	amount: number;
	api: string;
	decimal: number;
	programId: string;
	contractAddr: string;
	poolAddr: string;
};

export class StakeTransactionData {

	private _poolAddr = environment.POOL_ADDRESS;
	private _programId = environment.PROGRAM_ID;

	get wallet(): Wallet {
		return this._wallet;
	}

	constructor(
		private _wallet: Wallet = null, 
		private _amount: number = 0,
	) { }

	value(): StakeData {
		return {
			amount: this._amount,
			api: this._wallet?.api ?? '',
			decimal: this._wallet?.decimal ?? 0,
			contractAddr: this._wallet?.contractaddress ?? '',
			poolAddr: this._poolAddr,
			programId: this._programId,
		};
	}
}