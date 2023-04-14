import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { from, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  show(message: string = "", duration: number = 1500) {
    return from(this.toastController.create({
      message, duration, position: 'bottom'
    })).pipe(switchMap(toast => from(toast.present())));
  }
}
