import { Injectable } from '@angular/core';
import { Client, RealtimeResponseEvent, Account, ID, Databases } from 'appwrite';
import { from, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  readonly REALTIME_PATH = `databases.${environment.databaseId}.collections.${environment.collectionId}.documents`
  client: Client = new Client();
  database: Databases;
  authentication: Account;

  constructor() { 
    this.client.setEndpoint(environment.apiEndpoint)
    .setProject(environment.projectId);
    this.authentication = new Account(this.client);
    this.database = new Databases(this.client);
  }

  saveMessage(name: string, email: string, message: string) {
    return from(this.database.createDocument(environment.databaseId, environment.collectionId, ID.unique(), {
      name, email, message
    }));
  }

  createAccount(name: string, email: string, password: string) {
    return from(this.authentication.create(ID.unique(), email, password, name))
  }

  disposeSession() {
    return from(this.authentication.deleteSessions());
  }

  getSession() {
    return from(this.authentication.get());
  }

  login(email: string, password: string) {
    return from(this.authentication.createEmailSession(email, password));
  }

  getMessages() {
    return from(this.database.listDocuments(environment.databaseId, environment.collectionId));
  }

  listenToChat(callback: (response: any) => void) {
    this.client.subscribe(this.REALTIME_PATH, (resp) => {
      callback(resp);
    })
  }
}
