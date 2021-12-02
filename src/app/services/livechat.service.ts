import { Injectable } from '@angular/core';
import { LiveChatWidgetApiModel, LiveChatWidgetModel } from '@livechat/angular-widget';
import { AuthenticationProvider } from '../providers/data/authentication.provider';

@Injectable({
  providedIn: 'root',
})
export class LivechatService {
  private liveChatApi: LiveChatWidgetApiModel;
  private widget: LiveChatWidgetModel;

  constructor(private authProvider: AuthenticationProvider) {}

  closeChat() {
    this.liveChatApi.hide_chat_window();
  }

  logEvent(page: string, date: Date): void {
    return this.liveChatApi.update_custom_variables([
      { name: page, value: date.toLocaleString('cs-CZ') },
    ]);
  }

  initialize(api: LiveChatWidgetApiModel, widget: LiveChatWidgetModel) {
    this.liveChatApi = api;
    this.widget = widget;
  }

  minimalize() {
    this.widget.hideChatWindow();
  }

  openChat() {
    this.authenticateUser();
    if (this.isRunning) {
      this.liveChatApi.open_chat_window();
    } else {
      this.widget.openChatWindow();
    }
  }

  showWidget() {
    this.widget.openChatWindow();
    this.widget.minimizeChatWindow();
  }

  get isHidden(): boolean {
    return this.liveChatApi.chat_window_hidden() as unknown as boolean;
  }

  private get isRunning(): boolean {
    return this.liveChatApi.chat_running() as unknown as boolean;
  }

  private authenticateUser() {
    if (!!this.authProvider.accountValue) {
      this.liveChatApi.set_visitor_email(this.authProvider.accountValue.email);
      this.liveChatApi.set_visitor_name(this.authProvider.accountValue.email);
      this.liveChatApi.update_custom_variables([
        { name: 'uid', value: this.authProvider.accountValue.uid },
        { name: 'identityVerificationLevel', value: this.authProvider.accountValue.lvl },
      ]);
    }
  }
}
