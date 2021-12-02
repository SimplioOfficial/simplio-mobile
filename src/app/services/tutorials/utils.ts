import { UserID } from 'src/app/interface/global';
import { tutorialsBody } from 'src/app/providers/tutorials/tutorials-data';

export const createTutorials = (uid: UserID) => Object.seal({ ...tutorialsBody, uid });
