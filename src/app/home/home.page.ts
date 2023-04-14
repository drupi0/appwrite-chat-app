import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonicModule, Platform, ToastController } from '@ionic/angular';
import { ApiService } from '../service/api.service';
import { switchMap, from, finalize, firstValueFrom, interval, take, first, EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ToastService } from '../service/toast.service';
import { Models } from 'appwrite';

interface MessageObj {
  name: string, message: string, email: string
}
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class HomePage implements OnInit, AfterViewInit {
  messages: MessageObj[] = [];
  message: string = "";
  currentSession: Models.Preferences | undefined;

  @ViewChild('content') private content: IonContent | undefined;

  ngOnInit(): void {
    this.api.getSession().subscribe(session => {
      this.currentSession = session;
    });

    this.api.listenToChat((response) => {

      const { payload } = response;
      const { name, email, message } = payload;

      this.messages.push({
        name, email, message
      });

      interval(500).pipe(first()).subscribe(() => {
        this.content?.scrollToBottom(500);

        if(!this.currentSession) {
          return;
        }

        const sessionEmail: string = this.currentSession['email'];

        if(sessionEmail !== email) {
          this.notify({ name, email, message});
        }
      });
    });

    this.getAllMessages();

    this.requestPermissions();
  }

  ngAfterViewInit(): void {
    interval(500).pipe(first()).subscribe(() => {
      this.content?.scrollToBottom(500);
    });
  }


  reverse(messages: MessageObj[]) {
    return messages.reverse();
  }

  sendMessage() {
    if(!this.message) {
      return;
    }

    this.api.getSession().pipe(switchMap(accountSession => {
      const { name, email } = accountSession
      return this.api.saveMessage(name, email, this.message);
    })).subscribe(() => {
      this.message = "";
    });
  }

  getAllMessages() {
    this.api.getMessages().subscribe(allMessages => {
      if(!allMessages.documents.length) {
        return;
      }

      this.messages.push(...(allMessages.documents as unknown as MessageObj[]));
    })
  }

  logout() {
    this.api.disposeSession().subscribe(() => {
      this.route.navigate(["login"])
    });
  }

  private requestPermissions() {
    if(!this.platform.is('android')) {
      return;
    }

    from(LocalNotifications.requestPermissions())
      .pipe(switchMap(permission => {
        if (permission.display !== 'granted') {
          return this.toastSvc.show("Notification permission is not yet granted", 3000);
        }

        return EMPTY;
      })).subscribe();
  }

  notify(message: MessageObj) {
    if(!this.platform.is('android')) {
      return;
    }

    const randomId = Math.floor(Math.random() * 10000) + 1;

    from(LocalNotifications.schedule(
      {
        notifications: [{
          title: `New message from ${message.name}`,
          body: message.message,
          id: randomId
        }]
      }
    )).subscribe();
  }

  constructor(private api: ApiService, private route: Router, 
    private toastSvc: ToastService, private platform: Platform) { }

}
