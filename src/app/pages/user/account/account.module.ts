import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'kyc',
  },
  {
    path: 'kyc',
    loadChildren: () => import('./kyc-sum-sub/kyc-sum-sub.module').then(m => m.KycSumSubPageModule),
    data: { tapbar: false },
  },
  {
    path: 'lock',
    loadChildren: () =>
      import('./account-lock/account-lock.module').then(m => m.AccountLockPageModule),
    data: { tapbar: false },
  },
  {
    path: 'lock-final',
    loadChildren: () =>
      import('./account-lock-final/account-lock-final.module').then(
        m => m.AccountLockFinalPageModule,
      ),
    data: { tapbar: false },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class AccountPageModule {}
