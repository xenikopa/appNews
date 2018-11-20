import { Injectable } from '@angular/core';
import { IAppContainerService } from './common/IAppContainerService';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable()
class AppContainerService extends IAppContainerService {
  public isAdminLogin$: Subject<boolean> =
    new BehaviorSubject(false);
  constructor() {
    super();
  }

  public onLoginAdmin(): void {
    this.isAdminLogin$.next(true);
  }

  public onLogoutAdmin(): void {
    this.isAdminLogin$.next(false);
  }
}

export { AppContainerService };