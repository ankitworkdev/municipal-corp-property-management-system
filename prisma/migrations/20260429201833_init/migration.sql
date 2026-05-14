-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EO', 'HC', 'TI', 'GO', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('LAND_AND_BUILDING', 'VACANT_LAND');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('SINGLE_OWNER', 'JOINT_OWNER', 'INSTITUTIONAL', 'GOVERNMENT');

-- CreateEnum
CREATE TYPE "OccupancyType" AS ENUM ('SELF_OCCUPIED', 'TENANT');

-- CreateEnum
CREATE TYPE "UsageCategory" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ConstructionType" AS ENUM ('RCC_ROOF', 'ASBESTOS_ROOF', 'OTHER');

-- CreateEnum
CREATE TYPE "RoadType" AS ENUM ('PRINCIPAL_MAIN_ROAD', 'MAIN_ROAD', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('ONLINE', 'CASH', 'CHEQUE', 'DD', 'NEFT', 'RTGS');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GrievanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "HousingScheme" AS ENUM ('YES', 'NO');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentPurpose" AS ENUM ('GALLERY', 'ANNOUNCEMENT', 'NOTICE', 'BANNER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT NOT NULL,
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staffs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_ward_assignments" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "ward_id" TEXT NOT NULL,

    CONSTRAINT "staff_ward_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "road_type" "RoadType" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "roads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_years" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "assessment_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arv_rates" (
    "id" TEXT NOT NULL,
    "assessment_year_id" TEXT NOT NULL,
    "road_type" "RoadType" NOT NULL,
    "construction_type" "ConstructionType" NOT NULL,
    "usage_category" "UsageCategory" NOT NULL,
    "rate_per_sq_ft" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "arv_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_tax_rates" (
    "id" TEXT NOT NULL,
    "assessment_year_id" TEXT NOT NULL,
    "rate_percent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "property_tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupancy_type_configs" (
    "id" TEXT NOT NULL,
    "assessment_year_id" TEXT NOT NULL,
    "occupancy_type" "OccupancyType" NOT NULL,
    "multiplier_value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "occupancy_type_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_type_configs" (
    "id" TEXT NOT NULL,
    "assessment_year_id" TEXT NOT NULL,
    "usage_category" "UsageCategory" NOT NULL,
    "multiplier_value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "usage_type_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_factor_configs" (
    "id" TEXT NOT NULL,
    "assessment_year_id" TEXT NOT NULL,
    "factor_name" TEXT NOT NULL,
    "multiplier_value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "usage_factor_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_type_configs" (
    "id" TEXT NOT NULL,
    "assessment_year_id" TEXT NOT NULL,
    "discount_type" TEXT NOT NULL,
    "rate_percent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "discount_type_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_rate_configs" (
    "id" TEXT NOT NULL,
    "assessment_year_id" TEXT NOT NULL,
    "rate_percent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "interest_rate_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solid_waste_charges" (
    "id" TEXT NOT NULL,
    "consumer_type" TEXT NOT NULL,
    "yearly_charge" DOUBLE PRECISION NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "solid_waste_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacant_land_tax_rates" (
    "id" TEXT NOT NULL,
    "assessment_year_id" TEXT NOT NULL,
    "road_type" "RoadType" NOT NULL,
    "rate_per_sq_ft" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "vacant_land_tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacant_land_thresholds" (
    "id" TEXT NOT NULL,
    "assessment_year_id" TEXT NOT NULL,
    "threshold_percent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "vacant_land_thresholds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "setting_name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "property_type" "PropertyType" NOT NULL,
    "ownership_type" "OwnershipType" NOT NULL,
    "housing_scheme" "HousingScheme" NOT NULL DEFAULT 'NO',
    "ward_id" TEXT NOT NULL,
    "road_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "old_holding_number" TEXT,
    "new_holding_number" TEXT,
    "acquisition_date" TIMESTAMP(3),
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "owner_name" TEXT NOT NULL,
    "guardian_name" TEXT,
    "gender" "Gender",
    "property_address" TEXT,
    "property_city" TEXT,
    "property_state" TEXT,
    "property_pincode" TEXT,
    "corr_address" TEXT,
    "corr_city" TEXT,
    "corr_state" TEXT,
    "corr_pincode" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "alternate_mobile" TEXT,
    "water_connection" BOOLEAN NOT NULL DEFAULT false,
    "solid_waste_consumer_type" TEXT,
    "construction_type" "ConstructionType",
    "occupancy_type_value" "OccupancyType",
    "usage_category" "UsageCategory",
    "usage_factor" TEXT,
    "plot_area_sq_ft" DOUBLE PRECISION,
    "built_up_area_sq_ft" DOUBLE PRECISION,
    "number_of_floors" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "assessment_year_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "form_status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
    "arv_amount" DOUBLE PRECISION,
    "property_tax" DOUBLE PRECISION,
    "total_discount" DOUBLE PRECISION,
    "solid_waste_charge" DOUBLE PRECISION,
    "water_charge" DOUBLE PRECISION,
    "fine_amount" DOUBLE PRECISION,
    "interest_amount" DOUBLE PRECISION,
    "total_demand" DOUBLE PRECISION,
    "net_payable" DOUBLE PRECISION,
    "created_by_id" TEXT,
    "submitted_by_id" TEXT,
    "approved_by_id" TEXT,
    "last_modified_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demands" (
    "id" TEXT NOT NULL,
    "demand_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance_amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT,
    "order_id" TEXT,
    "demand_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_mode" "PaymentMode" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "cheque_number" TEXT,
    "transaction_ref" TEXT,
    "paid_by_id" TEXT,
    "order_created_by_id" TEXT,
    "payment_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "demand_id" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "comments" TEXT,
    "supporting_doc_url" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grievances" (
    "id" TEXT NOT NULL,
    "property_id" TEXT,
    "ward_id" TEXT,
    "user_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "GrievanceStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grievances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_contents" (
    "id" TEXT NOT NULL,
    "purpose" "ContentPurpose" NOT NULL DEFAULT 'GALLERY',
    "title" TEXT,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "helpline_numbers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "designation" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "helpline_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "useful_links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "useful_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "officer_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "photo_url" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "officer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_about_us" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "website_about_us_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "is_key_service" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "website_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_user_id_key" ON "staffs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_ward_assignments_staff_id_ward_id_key" ON "staff_ward_assignments"("staff_id", "ward_id");

-- CreateIndex
CREATE UNIQUE INDEX "wards_name_key" ON "wards"("name");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_years_year_key" ON "assessment_years"("year");

-- CreateIndex
CREATE UNIQUE INDEX "arv_rates_assessment_year_id_road_type_construction_type_us_key" ON "arv_rates"("assessment_year_id", "road_type", "construction_type", "usage_category");

-- CreateIndex
CREATE UNIQUE INDEX "property_tax_rates_assessment_year_id_key" ON "property_tax_rates"("assessment_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "occupancy_type_configs_assessment_year_id_occupancy_type_key" ON "occupancy_type_configs"("assessment_year_id", "occupancy_type");

-- CreateIndex
CREATE UNIQUE INDEX "usage_type_configs_assessment_year_id_usage_category_key" ON "usage_type_configs"("assessment_year_id", "usage_category");

-- CreateIndex
CREATE UNIQUE INDEX "usage_factor_configs_assessment_year_id_factor_name_key" ON "usage_factor_configs"("assessment_year_id", "factor_name");

-- CreateIndex
CREATE UNIQUE INDEX "discount_type_configs_assessment_year_id_discount_type_key" ON "discount_type_configs"("assessment_year_id", "discount_type");

-- CreateIndex
CREATE UNIQUE INDEX "interest_rate_configs_assessment_year_id_key" ON "interest_rate_configs"("assessment_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "vacant_land_tax_rates_assessment_year_id_road_type_key" ON "vacant_land_tax_rates"("assessment_year_id", "road_type");

-- CreateIndex
CREATE UNIQUE INDEX "vacant_land_thresholds_assessment_year_id_key" ON "vacant_land_thresholds"("assessment_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_setting_name_key" ON "system_settings"("setting_name");

-- CreateIndex
CREATE UNIQUE INDEX "properties_property_id_key" ON "properties"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessments_assessment_year_id_property_id_key" ON "assessments"("assessment_year_id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "demands_demand_id_key" ON "demands"("demand_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_id_key" ON "payments"("payment_id");

-- AddForeignKey
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_ward_assignments" ADD CONSTRAINT "staff_ward_assignments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staffs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_ward_assignments" ADD CONSTRAINT "staff_ward_assignments_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arv_rates" ADD CONSTRAINT "arv_rates_assessment_year_id_fkey" FOREIGN KEY ("assessment_year_id") REFERENCES "assessment_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_tax_rates" ADD CONSTRAINT "property_tax_rates_assessment_year_id_fkey" FOREIGN KEY ("assessment_year_id") REFERENCES "assessment_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupancy_type_configs" ADD CONSTRAINT "occupancy_type_configs_assessment_year_id_fkey" FOREIGN KEY ("assessment_year_id") REFERENCES "assessment_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_type_configs" ADD CONSTRAINT "usage_type_configs_assessment_year_id_fkey" FOREIGN KEY ("assessment_year_id") REFERENCES "assessment_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_factor_configs" ADD CONSTRAINT "usage_factor_configs_assessment_year_id_fkey" FOREIGN KEY ("assessment_year_id") REFERENCES "assessment_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_type_configs" ADD CONSTRAINT "discount_type_configs_assessment_year_id_fkey" FOREIGN KEY ("assessment_year_id") REFERENCES "assessment_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_rate_configs" ADD CONSTRAINT "interest_rate_configs_assessment_year_id_fkey" FOREIGN KEY ("assessment_year_id") REFERENCES "assessment_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacant_land_tax_rates" ADD CONSTRAINT "vacant_land_tax_rates_assessment_year_id_fkey" FOREIGN KEY ("assessment_year_id") REFERENCES "assessment_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacant_land_thresholds" ADD CONSTRAINT "vacant_land_thresholds_assessment_year_id_fkey" FOREIGN KEY ("assessment_year_id") REFERENCES "assessment_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_road_id_fkey" FOREIGN KEY ("road_id") REFERENCES "roads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_assessment_year_id_fkey" FOREIGN KEY ("assessment_year_id") REFERENCES "assessment_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_last_modified_by_id_fkey" FOREIGN KEY ("last_modified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demands" ADD CONSTRAINT "demands_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_demand_id_fkey" FOREIGN KEY ("demand_id") REFERENCES "demands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_paid_by_id_fkey" FOREIGN KEY ("paid_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_created_by_id_fkey" FOREIGN KEY ("order_created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_demand_id_fkey" FOREIGN KEY ("demand_id") REFERENCES "demands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
