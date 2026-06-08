-- AlterTable
ALTER TABLE "User" ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "height_cm" DOUBLE PRECISION,
ADD COLUMN     "weight_kg" DOUBLE PRECISION;
