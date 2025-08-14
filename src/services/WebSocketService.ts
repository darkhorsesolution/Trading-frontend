import { ReadyState } from 'react-use-websocket';

export interface WebSocketMessage {
  subject: string;
  obj: any;
  token?: string;
}

export interface LogonRequest {
  account: string;
  password: string;
  host: string;
}

export interface LogonResponse {
  status: boolean;
  token: string;
  message?: string;
}

export interface MarketDataRequest {
  subscribe: boolean;
  marketDepth: number;
  symbols: string[];
}

export interface MarketDataTick {
  symbol: string;
  bids: Array<{ p: number; q: number }>;
  offers: Array<{ p: number; q: number }>;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private token: string | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private isAuthenticated: boolean = false;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public setToken(token: string): void {
    this.token = token;
    this.isAuthenticated = true;
    localStorage.setItem('ws_token', token);
  }

  public getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('ws_token');
    }
    return this.token;
  }

  public clearToken(): void {
    this.token = null;
    this.isAuthenticated = false;
    localStorage.removeItem('ws_token');
  }

  public isLoggedIn(): boolean {
    return this.isAuthenticated && !!this.token;
  }

  public createLogonMessage(account: string, password: string, host: string = '1.1.1.1'): string {
    const message: WebSocketMessage = {
      subject: 'logon',
      obj: {
        account,
        password,
        host
      }
    };
    return JSON.stringify(message);
  }

  public createMarketDataRequest(symbols: string[], marketDepth: number = 3): string {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    const message: WebSocketMessage = {
      token: this.token,
      subject: 'mdRequest',
      obj: {
        subscribe: true,
        marketDepth,
        symbols
      }
    };
    return JSON.stringify(message);
  }

  public createOrderMessage(orderData: any): string {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    const message: WebSocketMessage = {
      token: this.token,
      subject: 'orderRequest',
      obj: orderData
    };
    return JSON.stringify(message);
  }

  public parseMessage(data: string): WebSocketMessage | null {
    try {
      const message = JSON.parse(data);
      
      // Handle nested JSON in obj field
      if (typeof message.obj === 'string') {
        try {
          message.obj = JSON.parse(message.obj);
        } catch (e) {
          // obj is not JSON, keep it as string
        }
      }
      
      return message;
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      return null;
    }
  }

  public handleLogonResponse(message: WebSocketMessage): LogonResponse | null {
    if (message.subject === 'logonResponse' && message.obj) {
      const response = message.obj as LogonResponse;
      if (response.status && response.token) {
        this.setToken(response.token);
      }
      return response;
    }
    return null;
  }

  public queueMessage(message: WebSocketMessage): void {
    this.messageQueue.push(message);
  }

  public getQueuedMessages(): WebSocketMessage[] {
    const messages = [...this.messageQueue];
    this.messageQueue = [];
    return messages;
  }

  public getConnectionStateString(readyState: ReadyState): string {
    switch (readyState) {
      case ReadyState.CONNECTING:
        return 'Connecting';
      case ReadyState.OPEN:
        return 'Connected';
      case ReadyState.CLOSING:
        return 'Closing';
      case ReadyState.CLOSED:
        return 'Disconnected';
      case ReadyState.UNINSTANTIATED:
        return 'Uninstantiated';
      default:
        return 'Unknown';
    }
  }
}

export default WebSocketService.getInstance();