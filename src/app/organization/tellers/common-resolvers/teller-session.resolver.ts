/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

/**
 * Tellers data resolver.
 */
@Injectable()
export class TellerSessionResolver implements Resolve<Object> {

  /**
   * @param {OrganizationService} organizationService Organization service.
   */
  constructor(private organizationService: OrganizationService,private authenticationService: AuthenticationService,) {}

  /**
   * Returns the Tellers data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    const credential = this.authenticationService.getCredentials();
    if(credential.staffId===undefined){
      return;
    }
    return this.organizationService.getLoggerTellers(credential.staffId);
  }

}
