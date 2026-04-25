export interface OrelloAccountData {
    message?: string;
    accessToken?: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface AccessTokenValidationUser {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

export interface AccessTokenValidationData {
    valid?: boolean;
    user?: AccessTokenValidationUser;
}

export interface CurrentUserData {
    _id?: string;
    id?: string;
    uid?: string;
    orelloId?: string;
    firstName?: string;
    lastName?: string;
    otherName?: string | null;
    username?: string | null;
    bio?: string | null;
    email?: {
        _id?: string;
        address?: string;
        verified?: boolean;
    };
    metadata?: {
        _id?: string;
        isFirstTime?: boolean;
        profileColors?: string[];
    };
    status?: string;
    role?: string;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    connectedApps?: string[];
}

export interface RequestUserData {
    id: string;
    uid?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
    status: string;
}

export interface ProjectData {
    id?: string;
    uid: string;
    name: string;
    description?: string;
    prompt?: string;
    model?: string;
    owner: string;
    nodes?: any[];
    metadata?: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
}
