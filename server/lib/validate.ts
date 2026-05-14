import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Validation middleware factory
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`);
      return res.status(400).json({ error: "Validation failed", details: errors });
    }
    req.body = result.data;
    next();
  };
}

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const citizenLoginSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid 10-digit mobile"),
  password: z.string().min(1, "Password required"),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name required").max(50),
  lastName: z.string().min(1, "Last name required").max(50),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid 10-digit mobile"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// Property schemas
export const createPropertySchema = z.object({
  wardId: z.string().min(1, "Ward required"),
  ownerName: z.string().min(1, "Owner name required"),
  mobile: z.string().min(1, "Mobile required"),
  propertyType: z.enum(["LAND_AND_BUILDING", "VACANT_LAND"]).default("LAND_AND_BUILDING"),
  ownershipType: z.enum(["SINGLE_OWNER", "JOINT_OWNER", "INSTITUTIONAL", "GOVERNMENT"]).default("SINGLE_OWNER"),
  roadId: z.string().optional(),
  guardianName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  propertyAddress: z.string().optional(),
  propertyCity: z.string().optional(),
  propertyState: z.string().optional(),
  constructionType: z.enum(["RCC_ROOF", "ASBESTOS_ROOF", "OTHER"]).optional(),
  occupancyType: z.enum(["SELF_OCCUPIED", "TENANT"]).optional(),
  usageCategory: z.enum(["RESIDENTIAL", "COMMERCIAL", "OTHER"]).optional(),
  plotArea: z.string().optional(),
  builtUpArea: z.string().optional(),
  plotAreaSqFt: z.number().optional(),
  builtUpAreaSqFt: z.number().optional(),
}).passthrough();

// Assessment schemas
export const createAssessmentSchema = z.object({
  assessmentYearId: z.string().min(1, "Assessment year required"),
  propertyId: z.string().min(1, "Property required"),
});

export const updateAssessmentSchema = z.object({
  id: z.string().min(1, "ID required"),
  action: z.enum(["submit", "approve", "reject"]).optional(),
}).passthrough();

// Payment schema
export const updatePaymentSchema = z.object({
  demandId: z.string().min(1, "Demand ID required"),
  paymentMode: z.enum(["CASH", "ONLINE", "CHEQUE", "DD", "NEFT", "RTGS"]),
  orderId: z.string().optional(),
  chequeNumber: z.string().optional(),
});
