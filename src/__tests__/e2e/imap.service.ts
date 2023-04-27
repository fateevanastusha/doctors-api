import { simpleParser } from 'mailparser';
// @ts-ignore
import ImapClient from 'emailjs-imap-client';

export class MailBoxImap {
  private imap: ImapClient;

  constructor() {
    this.imap = new ImapClient('imap.yandex.com', 993, {
      auth: {
        user: 'fateevanastushatest@yandex.ru',
        pass: 'bflsaskvhftuxfti',
      },
      useSecureTransport: true,
      logLevel: 'LOG_LEVEL_NONE',
    });
  }

  private async searchMessagesIdxBySubject(subject: string): Promise<number[]> {
    return await this.imap.search('INBOX', {
      header: ['subject', `${subject}`],
      since: new Date(),
    });
  }

  private searchAllTodayMessagesIdx = async (): Promise<number[]> => {
    return await this.imap.search('INBOX', {
      since: new Date(),
    });
  };

  deleteAllTodayMessages = async () => {
    const messagesIdx = await this.searchAllTodayMessagesIdx();
    if (!messagesIdx?.length) {
      return;
    }

    await this.imap.deleteMessages('INBOX', `${messagesIdx.join(',')}`);
  };

  async deleteAllMessagesBySubject(subject: string) {
    const messagesIdx = await this.searchMessagesIdxBySubject(subject);
    if (!messagesIdx?.length) {
      return;
    }

    await this.imap.deleteMessages('INBOX', `${messagesIdx.join(',')}`);
  }

  private async getMessageByIdx(idx: string): Promise<string | null> {
    const messages = await this.imap.listMessages('INBOX', `${idx}`, [
      'body[]',
    ]);

    return (messages[0] && messages[0]['body[]']) || null;
  }

  async getLastMessageBySubject(subject: string): Promise<string | null> {
    const messagesIdx = await this.searchMessagesIdxBySubject(subject);
    if (!messagesIdx?.length) {
      return null;
    }
    const lastMessageIdx = messagesIdx.length - 1;

    return await this.getMessageByIdx(messagesIdx[lastMessageIdx].toString());
  }

  async getMessageSubject(message: string): Promise<string | null> {
    if (!message) {
      return null;
    }
    const parsed = await simpleParser(message);

    return parsed?.subject || null;
  }

  async getMessageHtml(message: string): Promise<string | null> {
    if (!message) {
      return null;
    }

    const parsed = await simpleParser(message);

    return parsed?.html || parsed?.textAsHtml || null;
  }

  async connectToMail() {
    await this.imap.connect();
  }

  async disconnect() {
    await this.imap.close();
  }

  async waitNewMessage(minutes: number) {
    return new Promise<string>(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(`no message found after ${minutes} minutes waiting`);
      }, 1000 * 60 * minutes);

      try {
        await this.getMessageByIdx('99999999'); //need for subscribe correct work

        this.imap.onupdate = async (path: string, type: any, value: any) => {
          if (type === 'exists') {
            const receivedMessage: any = await this.getMessageByIdx(`${value}`);

            clearTimeout(timeoutId);
            resolve(receivedMessage);
          }
        };
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }
}
