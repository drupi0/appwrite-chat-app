import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../service/api.service';
import { EMPTY, catchError, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../service/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  constructor(private api: ApiService, private route: Router, private toastSvc: ToastService) { }

  isRegister: boolean = false;

  loginForm: FormGroup = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.min(3)]),
    email: new FormControl("", [Validators.email, Validators.required]),
    password: new FormControl("", [Validators.min(8), Validators.required])
  })

  ngOnInit() {
    this.api.getSession().pipe(catchError(() => EMPTY)).subscribe(session => {
      if(session) {
        this.route.navigate(["home"]);
      }
    })
  }

  reset(): void {
    this.loginForm.reset();
  }


  login(): void {
    const { email, password } = this.loginForm.getRawValue();
    this.api.login(email, password).pipe(
      catchError(() => this.toastSvc.show("Login with valid credentials", 2000)
        .pipe(switchMap(() => EMPTY))),
      switchMap((session) => this.toastSvc.show(`Logged in as ${session.providerUid}`)))
      .subscribe(() => {
        this.isRegister = false;
        this.route.navigate(["home"]);
        this.reset();
      });
  }

  register(): void {
    const { name, email, password } = this.loginForm.getRawValue();
    this.api.createAccount(name, email, password).pipe(
      catchError(() => this.toastSvc.show("Error creating account", 2000)
        .pipe(switchMap(() => EMPTY))),
      switchMap(() => this.toastSvc.show(`Successfully created account`, 2000))
    ).subscribe(() => {
      this.isRegister = false;
      this.reset();
    })
  }

}
