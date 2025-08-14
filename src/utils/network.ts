enum StatusCode {
  StatusContinue = 100,
  StatusSwitchingProtocols = 101,
  StatusProcessing = 102,
  StatusEarlyHints = 103,

  StatusOK = 200,
  StatusCreated = 201,
  StatusAccepted = 202,
  StatusNonAuthoritativeInfo = 203,
  StatusNoContent = 204,
  StatusResetContent = 205,
  StatusPartialContent = 206,
  StatusMultiStatus = 207,
  StatusAlreadyReported = 208,
  StatusIMUsed = 226,

  StatusMultipleChoices = 300,
  StatusMovedPermanently = 301,
  StatusFound = 302,
  StatusSeeOther = 303,
  StatusNotModified = 304,
  StatusUseProxy = 305,
  StatusTemporaryRedirect = 307,
  StatusPermanentRedirect = 308,

  StatusBadRequest = 400,
  StatusUnauthorized = 401,
  StatusPaymentRequired = 402,
  StatusForbidden = 403,
  StatusNotFound = 404,
  StatusMethodNotAllowed = 405,
  StatusNotAcceptable = 406,
  StatusProxyAuthRequired = 407,
  StatusRequestTimeout = 408,
  StatusConflict = 409,
  StatusGone = 410,
  StatusLengthRequired = 411,
  StatusPreconditionFailed = 412,
  StatusRequestEntityTooLarge = 413,
  StatusRequestURITooLong = 414,
  StatusUnsupportedMediaType = 415,
  StatusRequestedRangeNotSatisfiable = 416,
  StatusExpectationFailed = 417,
  StatusTeapot = 418,
  StatusMisdirectedRequest = 421,
  StatusUnprocessableEntity = 422,
  StatusLocked = 423,
  StatusFailedDependency = 424,
  StatusTooEarly = 425,
  StatusUpgradeRequired = 426,
  StatusPreconditionRequired = 428,
  StatusTooManyRequests = 429,
  StatusRequestHeaderFieldsTooLarge = 431,
  StatusUnavailableForLegalReasons = 451,

  StatusInternalServerError = 500,
  StatusNotImplemented = 501,
  StatusBadGateway = 502,
  StatusServiceUnavailable = 503,
  StatusGatewayTimeout = 504,
  StatusHTTPVersionNotSupported = 505,
  StatusVariantAlsoNegotiates = 506,
  StatusInsufficientStorage = 507,
  StatusLoopDetected = 508,
  StatusNotExtended = 510,
  StatusNetworkAuthenticationRequired = 511,
}

export type IPagesResponse<T> = {
  data: T[];
  page: number;
  totalPages: number;
};

export interface IGenericResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
}

function ApiFetch<T>(url: string): Promise<T> {
  return fetch(url, {
    method: "GET",
    headers: {
      timestamp: new Date().getTime().toString(),
    },
  }).then((response) => {
    if (!response.ok) {
      throw response;
    }
    return response.json();
  });
}

function ApiPost<T>(
  url: string,
  data?: any,
  method = "POST"
): Promise<IGenericResponse<T>> {
  return fetch(url, {
    method,
    body: JSON.stringify(data),
    headers: {
      timestamp: new Date().getTime().toString(),
      "Content-Type": "application/json",
    },
  }).then(async (response) => {
    if (!response.ok) {
      throw response;
    }
    const confirmation: IGenericResponse<T> = await response.json();
    if (confirmation.code >= 300) throw new Error(confirmation.message);

    return new Promise((resolve) => {
      resolve(confirmation);
    });
  });
}

export { StatusCode, ApiFetch, ApiPost };
