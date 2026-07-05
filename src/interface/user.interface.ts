export interface RegisterUserPayload {
    name: string;
    email: string;
    password: string;
    role?: "TENANT" | "LANDLORD" | "ADMIN"; // Optional role field, default is "TENANT"
    profilePhoto?: string;
}
