export interface RegisterUserPayload {
    name: string;
    email: string;
    password: string;
    role?: "TENANT" | "LANDLORD" | "ADMIN"; 
    profilePhoto?: string;
}
