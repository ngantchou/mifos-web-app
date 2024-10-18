// session-data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionDataService {
  private sessionData: any;

  setSessionData(data: any): void {
    this.sessionData = data;
  }

  getSessionData(): any {
    return this.sessionData;
  }
}
