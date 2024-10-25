export enum Role{
    User = 'User',
    Admin = 'Admin',
    Vendor ='Vendor'
}

export enum Status{
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UN_AUTHORISED = 401,
    FORBIDDEN=403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    BAD_GATEWAY = 502,
    CONFLICT=409
}