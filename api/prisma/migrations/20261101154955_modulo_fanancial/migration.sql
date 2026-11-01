-- CreateEnum
CREATE TYPE "ServicePriceStatus" AS ENUM ('PENDING', 'PAID', 'LATE');

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "refnumber" SERIAL NOT NULL,
    "register_id" INTEGER NOT NULL,
    "serviceprice_id" INTEGER NOT NULL,
    "paymethod_id" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "taxlimit" DECIMAL(65,30) NOT NULL,
    "descount" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "school_id" INTEGER NOT NULL,
    "status" "ServicePriceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paymethod" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Paymethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Serviceprice" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "year_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Serviceprice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_refnumber_key" ON "Payment"("refnumber");

-- CreateIndex
CREATE UNIQUE INDEX "Paymethod_name_key" ON "Paymethod"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_serviceprice_id_fkey" FOREIGN KEY ("serviceprice_id") REFERENCES "Serviceprice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymethod_id_fkey" FOREIGN KEY ("paymethod_id") REFERENCES "Paymethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paymethod" ADD CONSTRAINT "Paymethod_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serviceprice" ADD CONSTRAINT "Serviceprice_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serviceprice" ADD CONSTRAINT "Serviceprice_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serviceprice" ADD CONSTRAINT "Serviceprice_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serviceprice" ADD CONSTRAINT "Serviceprice_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serviceprice" ADD CONSTRAINT "Serviceprice_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
