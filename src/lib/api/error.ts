import {NextApiResponse} from "next";
import {logger} from "@/lib/logger";

/* This is special type for RTK query */
export interface IApiQueryError {
    data: IApiError,
    status: number
}

export interface IApiError {
    error: ERROR,
    code?: CODE,
    message?: string,
    pretty?: string
}

enum ERROR {
    UNAUTHORIZED = "UNAUTHORIZED",
    UNAUTHORIZED_ACCESS_TO_RESOURCES = "UNAUTHORIZED_ACCESS_TO_RESOURCES",
    BAD_METHOD = "BAD_METHOD",
    ALREADY_EXISTS = "ALREADY_EXISTS",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    MALFORMED_REQUEST = "MALFORMED_REQUEST",
    BOARD_MALFORMED_REQUEST = "BOARD_MALFORMED_REQUEST",
    BOARD_NOT_EXIST = "BOARD_NOT_EXIST",
    BOARD_UNKNOWN_ERROR = "BOARD_UNKNOWN_ERROR",
    BOARD_WIDGET_DELETE_ERROR = "BOARD_WIDGET_DELETE_ERROR",
    BOARD_WIDGET_MODIFY_UNAUTHORIZED = "BOARD_WIDGET_MODIFY_UNAUTHORIZED",
    QUERY_UNKNOWN_ERROR = "QUERY_UNKNOWN_ERROR",
    QUERY_NOT_FOUND = "QUERY_NOT_FOUND",
    QUERY_NOT_EXIST = "QUERY_NOT_EXIST",
    WIDGET_NOT_FOUND = "WIDGET_NOT_FOUND",
}

enum CODE {
    NOT_FOUND = "NOT_FOUND",
    ERROR = "ERROR"
}

const CODES = {
    [CODE.NOT_FOUND]: 404,
    [CODE.ERROR]: 500
};

const PrettyError = {
    [ERROR.UNAUTHORIZED]: "You are probably not logged in",
    [ERROR.UNAUTHORIZED_ACCESS_TO_RESOURCES]: "You are trying to modify something, which does not belong to you",
    [ERROR.BAD_METHOD]: "Wrong method, probably GET/POST/PUT/...",
    [ERROR.ALREADY_EXISTS]: "The thing you are trying to create already exists",
    [ERROR.UNKNOWN_ERROR]: "Unknown error",
    [ERROR.MALFORMED_REQUEST]: "Request object is malformed",

    [ERROR.BOARD_MALFORMED_REQUEST]: "Request object is malformed",
    [ERROR.BOARD_NOT_EXIST]: "Board does not exist",
    [ERROR.BOARD_UNKNOWN_ERROR]: "Unknown error",
    [ERROR.BOARD_WIDGET_DELETE_ERROR]: "Unable to remove widget from board",
    [ERROR.BOARD_WIDGET_MODIFY_UNAUTHORIZED]: "You are touching something, what does not belong to you",
    [ERROR.QUERY_UNKNOWN_ERROR]: "Unknown error",
    [ERROR.QUERY_NOT_FOUND]: "Query has not been found",
    [ERROR.QUERY_NOT_EXIST]: "Query does not exist",

    [ERROR.WIDGET_NOT_FOUND]: "Widget was not found",


};

const ApiErrorResponseFormatter = (errorResponse: IApiError) => {
    return errorResponse.message || PrettyError[errorResponse.error];
};

const ApiQueryErrorResponseFormatter = (errorResponse: IApiQueryError) => {
    return errorResponse && ApiErrorResponseFormatter(errorResponse?.data);
};

const isApiError = (error: IApiError | IApiQueryError) =>
    error && (("status" in error && error.status) || ("error" in error && error.error.length > 0));

const Error = ({error, message, code}: { error: ERROR, message: string, code?: CODE }): IApiError => {
    return {
        error,
        pretty: PrettyError[error],
        message,
        code
    };
};

const ApiError = ({
                      error,
                      code = CODE.ERROR,
                      message = '',
                      res,
                  }: IApiError & { res: NextApiResponse }) => {
    logger.error(error);
    res.status(CODES[code]).json(Error({error, message, code}));
};

export {
    isApiError,
    ApiError,
    ApiErrorResponseFormatter,
    ApiQueryErrorResponseFormatter,
    PrettyError,
    CODE,
    ERROR
};