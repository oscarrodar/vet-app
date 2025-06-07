export enum UserRole {
  VETERINARIAN = 'VETERINARIAN',
  TECHNICIAN = 'TECHNICIAN',
  RECEPTIONIST = 'RECEPTIONIST',
  ADMIN = 'ADMIN',
}

export const AllUserRoles = [
  UserRole.VETERINARIAN,
  UserRole.TECHNICIAN,
  UserRole.RECEPTIONIST,
  UserRole.ADMIN,
];

export const VeterinarianAndAdminRoles = [
  UserRole.VETERINARIAN,
  UserRole.ADMIN,
];

export const TechnicianAndAboveRoles = [
  UserRole.TECHNICIAN,
  UserRole.VETERINARIAN,
  UserRole.ADMIN,
];
