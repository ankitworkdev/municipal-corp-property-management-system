import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { ForgotPasswordPage } from "./pages/ForgotPassword";
import { HomePage } from "./pages/Home";
import { DashboardLayout } from "./pages/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { DataPage } from "./pages/DataPage";
import { NewAssessment } from "./pages/NewAssessment";
import { UpdatePayment } from "./pages/UpdatePayment";
import { ManageForms } from "./pages/ManageForms";
import { Settings } from "./pages/Settings";
import { PropertyDetail } from "./pages/PropertyDetail";
import { DisputesPage } from "./pages/Disputes";
import { GrievancesPage } from "./pages/Grievances";
import { ChangePassword } from "./pages/ChangePassword";
import { ArvMatrix } from "./pages/ArvMatrix";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div style={{ width: 24, height: 24, border: "3px solid #e05d36", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/eo" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

        <Route path="/eo" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="reporting" element={<DataPage title="Reports" api="/assessments" columns={[{key:"assessmentYear.year",h:"Year"},{key:"property.propertyId",h:"Property ID"},{key:"property.ward.name",h:"Ward"},{key:"formStatus",h:"Status",badge:true}]} />} />
          <Route path="manage-form" element={<ManageForms />} />
          <Route path="manage-dispute" element={<DisputesPage />} />
          <Route path="manage-grievances" element={<GrievancesPage />} />
          <Route path="payment-detail" element={<DataPage title="Payments" api="/payments" columns={[{key:"amount",h:"Amount",prefix:"₹"},{key:"paymentMode",h:"Mode"},{key:"paymentStatus",h:"Status",badge:true},{key:"paymentId",h:"ID"}]} />} />
          <Route path="update-payment" element={<UpdatePayment />} />
          <Route path="new-assessment" element={<NewAssessment />} />
          <Route path="wards" element={<DataPage title="Wards" api="/wards" columns={[{key:"name",h:"Ward Name"},{key:"description",h:"Description"}]} addFields={[{key:"name",label:"Name"},{key:"description",label:"Description"}]} />} />
          <Route path="roads" element={<DataPage title="Roads" api="/roads" columns={[{key:"name",h:"Road Name"},{key:"roadType",h:"Type"},{key:"description",h:"Desc"}]} addFields={[{key:"name",label:"Name"},{key:"roadType",label:"Type",type:"select",options:[{v:"PRINCIPAL_MAIN_ROAD",l:"Principal Main"},{v:"MAIN_ROAD",l:"Main Road"},{v:"OTHER",l:"Other"}]},{key:"description",label:"Description"}]} />} />
          <Route path="arv" element={<ArvMatrix />} />
          <Route path="property-tax-rate" element={<DataPage title="Property Tax Rate" api="/property-tax-rate" columns={[{key:"ratePercent",h:"Rate (%)"}]} />} />
          <Route path="occupancy-types" element={<DataPage title="Occupancy Types" api="/occupancy-types" columns={[{key:"occupancyType",h:"Type"},{key:"multiplierValue",h:"Multiplier"}]} />} />
          <Route path="usage-types" element={<DataPage title="Usage Types" api="/usage-types" columns={[{key:"usageCategory",h:"Type"},{key:"multiplierValue",h:"Multiplier"}]} />} />
          <Route path="usage-factors" element={<DataPage title="Usage Factors" api="/usage-factors" columns={[{key:"factorName",h:"Factor"},{key:"multiplierValue",h:"Multiplier"}]} />} />
          <Route path="discount-types" element={<DataPage title="Discounts" api="/discount-types" columns={[{key:"discountType",h:"Type"},{key:"ratePercent",h:"Rate (%)"}]} />} />
          <Route path="interest-rate" element={<DataPage title="Interest Rate" api="/interest-rate" columns={[{key:"ratePercent",h:"Rate (%)"}]} />} />
          <Route path="solid-waste-charges" element={<DataPage title="Solid Waste Charges" api="/solid-waste-charges" columns={[{key:"consumerType",h:"Consumer Type"},{key:"yearlyCharge",h:"Yearly (₹)"}]} />} />
          <Route path="vacant-land-tax-rates" element={<DataPage title="Vacant Land Rates" api="/vacant-land-tax-rates" columns={[{key:"roadType",h:"Road Type"},{key:"ratePerSqFt",h:"Rate/Sq.Ft"}]} />} />
          <Route path="vacant-land-threshold" element={<DataPage title="Vacant Land Threshold" api="/vacant-land-threshold" columns={[{key:"thresholdPercent",h:"Threshold (%)"}]} />} />
          <Route path="citizen-role" element={<DataPage title="Citizens" api="/users/citizens" columns={[{key:"firstName",h:"First"},{key:"lastName",h:"Last"},{key:"mobile",h:"Mobile"},{key:"status",h:"Status",badge:true}]} />} />
          <Route path="official-role" element={<DataPage title="Officials" api="/users/officials" columns={[{key:"firstName",h:"First"},{key:"lastName",h:"Last"},{key:"role",h:"Role"},{key:"email",h:"Email"},{key:"status",h:"Status",badge:true}]} addFields={[{key:"firstName",label:"First Name"},{key:"lastName",label:"Last Name"},{key:"email",label:"Email"},{key:"mobile",label:"Mobile"},{key:"role",label:"Role",type:"select",options:[{v:"EO",l:"Executive Officer"},{v:"HC",l:"Head Clerk"},{v:"TI",l:"Tax Inspector"},{v:"GO",l:"Grievance Officer"}]},{key:"password",label:"Password"}]} />} />
          <Route path="staffs" element={<DataPage title="Staff" api="/staffs" columns={[{key:"name",h:"Name"},{key:"email",h:"Email"},{key:"role",h:"Role"},{key:"assignedWards",h:"Wards"}]} />} />
          <Route path="properties" element={<DataPage title="Properties" api="/properties" columns={[{key:"propertyId",h:"ID"},{key:"propertyType",h:"Type"},{key:"ownerName",h:"Owner"},{key:"mobile",h:"Mobile"},{key:"verificationStatus",h:"Status",badge:true}]} rowLink="/eo/properties" />} />
          <Route path="properties/:id" element={<PropertyDetail />} />
          <Route path="manage-settings" element={<Settings />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="audit-logs" element={<DataPage title="Audit Logs" api="/audit-logs" columns={[{key:"action",h:"Action"},{key:"userName",h:"User"},{key:"userRole",h:"Role"},{key:"entity",h:"Entity"},{key:"details",h:"Details"}]} />} />
          <Route path="website-content/contents" element={<DataPage title="Website Content" api="/website-content/contents" columns={[{key:"purpose",h:"Purpose"},{key:"title",h:"Title"},{key:"thumbnailUrl",h:"Image",link:true}]} addFields={[{key:"purpose",label:"Purpose",type:"select",options:[{v:"GALLERY",l:"Gallery"},{v:"ANNOUNCEMENT",l:"Announcement"},{v:"NOTICE",l:"Notice"},{v:"BANNER",l:"Banner"}]},{key:"title",label:"Title"},{key:"description",label:"Description"},{key:"thumbnailUrl",label:"Image / media",type:"file",uploadFolder:"website"}]} />} />
          <Route path="website-content/helpline-numbers" element={<DataPage title="Helpline Numbers" api="/website-content/helpline-numbers" columns={[{key:"name",h:"Name"},{key:"number",h:"Number"}]} addFields={[{key:"name",label:"Name"},{key:"number",label:"Number"},{key:"designation",label:"Designation"}]} />} />
          <Route path="website-content/links" element={<DataPage title="Useful Links" api="/website-content/links" columns={[{key:"title",h:"Title"},{key:"url",h:"URL"}]} addFields={[{key:"title",label:"Title"},{key:"url",label:"URL"}]} />} />
          <Route path="website-content/officers-profile" element={<DataPage title="Officers" api="/website-content/officers-profile" columns={[{key:"name",h:"Name"},{key:"designation",h:"Designation"},{key:"photoUrl",h:"Photo",link:true}]} addFields={[{key:"name",label:"Name"},{key:"designation",label:"Designation"},{key:"mobile",label:"Mobile"},{key:"email",label:"Email"},{key:"photoUrl",label:"Photo",type:"file",uploadFolder:"officers"}]} />} />
          <Route path="website-content/services" element={<DataPage title="Website Services" api="/website-content/services" columns={[{key:"name",h:"Name"},{key:"isKeyService",h:"Key Service"},{key:"iconUrl",h:"Icon",link:true}]} addFields={[{key:"name",label:"Name"},{key:"description",label:"Description"},{key:"iconUrl",label:"Icon image",type:"file",uploadFolder:"services"},{key:"isKeyService",label:"Key service",type:"select",options:[{v:"true",l:"Yes"},{v:"false",l:"No"}]}]} />} />
        </Route>

        <Route path="*" element={<Navigate to="/eo" replace />} />
      </Routes>
    </AuthProvider>
  );
}
