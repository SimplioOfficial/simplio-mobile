import { AuthGuard } from 'src/app/guards/auth.guard';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { IsSecuredGuard } from './guards/is-secured.guard';
import { SetBiometricsGuard } from './guards/set-biometrics.guard';
import { NotAuthGuard } from 'src/app/guards/not-auth.guard';
import { SetCustomSeedGuard } from 'src/app/guards/set-custom-seed.guard';

const routes: Routes = [
  {
    path: 'home',
    canActivate: [SetBiometricsGuard, IsSecuredGuard, SetCustomSeedGuard, AuthGuard],
    loadChildren: () => import('./pages/home.module').then(m => m.HomePageModule),
  },
  {
    path: 'intro',
    loadChildren: () =>
      import('./public/introscreen/introscreen.module').then(m => m.IntroscreenPageModule),
  },
  {
    path: 'login',
    loadChildren: () => import('./public/login/login.module').then(m => m.LoginPageModule),
    canActivate: [NotAuthGuard],
    data: { tapbar: false },
  },
  {
    path: 'pin',
    loadChildren: () =>
      import('./public/create-pin/create-pin.module').then(m => m.CreatePinPageModule),
    canActivate: [AuthGuard],
    data: { tapbar: false },
  },
  {
    path: 'biometrics',
    loadChildren: () =>
      import('./public/activate-biometrics/activate-biometrics.module').then(
        m => m.ActivateBiometricsPageModule,
      ),
    canActivate: [AuthGuard],
    data: { tapbar: false },
  },
  {
    path: 'recovery',
    loadChildren: () =>
      import('./public/wallets-recovery/wallets-recovery.module').then(
        m => m.WalletsRecoveryPageModule,
      ),
    data: { tapbar: false },
  },
  {
    path: 'auth',
    loadChildren: () => import('./public/auth/auth.module').then(m => m.AuthPageModule),
    canActivate: [NotAuthGuard],
  },
  {
    path: 'register',
    loadChildren: () => import('./public/register/register.module').then(m => m.RegisterPageModule),
    canActivate: [NotAuthGuard],
    data: { tapbar: false },
  },
  {
    path: 'reset',
    loadChildren: () =>
      import('./public/password-recovery/password-recovery.module').then(
        m => m.PasswordRecoveryPageModule,
      ),
    canActivate: [NotAuthGuard],
    data: { tapbar: false },
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
