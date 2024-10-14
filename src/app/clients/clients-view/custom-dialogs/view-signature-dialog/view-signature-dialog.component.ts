/** Angular Imports */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * View signature dialog component.
 */
@Component({
  selector: 'mifosx-view-signature-dialog',
  templateUrl: './view-signature-dialog.component.html',
  styleUrls: ['./view-signature-dialog.component.scss']
})
export class ViewSignatureDialogComponent implements OnInit {

  /** Id of client signature in documents */
  signatureId: any;
  /** Signature Image */
  signatureImage: any;
  /** Client Id */
  clientId: any;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Documents data
   */
  constructor(public dialogRef: MatDialogRef<ViewSignatureDialogComponent>,
              private clientsService: ClientsService,
              private sanitizer: DomSanitizer,
              @Inject(MAT_DIALOG_DATA) public data: { documents: any[], id: string }) {
    const signature = this.data.documents.find((document: any) => document.name === 'signature') || {};
    this.signatureId = signature.id;
    this.clientId = this.data.id;
  }

  ngOnInit() {
    if (this.signatureId) {
      this.clientsService.getClientSignatureImage(this.clientId, this.signatureId).subscribe(
        (blob: Blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            // FileReader will return the base64 string when it's done reading the Blob
            const base64Image = reader.result as string;
            // Bypass security with DomSanitizer and set the image URL
            this.signatureImage = this.sanitizer.bypassSecurityTrustResourceUrl(base64Image);
          };
          reader.readAsDataURL(blob); // This will convert the Blob to base64
        }, (error: any) => {}
      );
    }
  }

}
