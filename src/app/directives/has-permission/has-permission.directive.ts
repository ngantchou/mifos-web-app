/** Angular Imports */
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

/** Custom Services */
import { AuthenticationService } from '../../core/authentication/authentication.service';

/**
 * Has Permission Directive
 */
@Directive({
  selector: '[mifosxHasPermission]'
})
export class HasPermissionDirective {

  /** User Permissions */
  private userPermissions: any[];

  /**
   * Extracts User Permissions from User Credentials
   * @param {TemplateRef} templateRef Template Reference
   * @param {ViewContainerRef} viewContainer View Container Reference
   * @param {AuthenticationService} authenticationService AuthenticationService
   */
  constructor(private templateRef: TemplateRef<any>,
              private viewContainer: ViewContainerRef,
              private authenticationService: AuthenticationService) {
    const savedCredentials = this.authenticationService.getCredentials();
    this.userPermissions = savedCredentials.permissions;
  }

  /**
   * Evaluates the condition to show template.
   * Now supports an array of permissions.
   */
  @Input()
  set mifosxHasPermission(permissions: any) {
    /** Clear the template beforehand to prevent overlap OnChanges. */
    this.viewContainer.clear();

    /** Ensure permissions is an array, or convert it to one */
    if (typeof permissions === 'string') {
      permissions = [permissions.trim()];
    } else if (!Array.isArray(permissions)) {
      throw new Error('mifosxHasPermission value must be a string or an array of strings');
    }
    /** Shows Template if the user has any of the permissions */
    if (this.hasAnyPermission(permissions)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  /**
   * Checks if user is permitted for any of the given permissions.
   * @param {string[]} permissions List of permissions to check
   * @returns {true} if user has at least one of the permissions
   */
  private hasAnyPermission(permissions: string[]) {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Checks if the user has a specific permission.
   * @param {string} permission Permission to check
   * @returns {true} if user has the permission
   */
  private hasPermission(permissions: string | string[]): boolean {
    // If permissions is a string, convert it to an array
    if (typeof permissions === 'string') {
      permissions = [permissions];
    }
  
    // Check if the user has the 'ALL_FUNCTIONS' permission
    if (this.userPermissions.includes('ALL_FUNCTIONS')) {
      return true;
    }
  
    // Loop through the array of permissions
    for (const permission of permissions) {
      // If the user has the 'ALL_FUNCTIONS_READ' permission and the permission starts with 'READ_', allow it
      if (permission.startsWith('READ_') && this.userPermissions.includes('ALL_FUNCTIONS_READ')) {
        return true;
      }
      // If the user has the specific permission, return true
      if (this.userPermissions.includes(permission)) {
        return true;
      }
    }
  
    // If no permission matched, return false
    return false;
  }
  

}
